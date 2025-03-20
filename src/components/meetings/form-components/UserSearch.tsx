
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  display_name: string;
  email: string;
  avatar_url?: string;
}

interface UserSearchProps {
  onUserSelect: (user: User) => void;
  selectedUsers: User[];
}

export const UserSearch: React.FC<UserSearchProps> = ({ onUserSelect, selectedUsers }) => {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      if (searchQuery.trim() === "") return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, display_name, email, avatar_url")
          .ilike("display_name", `%${searchQuery}%`)
          .limit(10);

        if (error) throw error;
        
        // Filter out already selected users
        const filteredUsers = data.filter(
          user => !selectedUsers.some(selected => selected.id === user.id)
        );
        
        setUsers(filteredUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      if (searchQuery) fetchUsers();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedUsers]);

  const handleSelect = (user: User) => {
    onUserSelect(user);
    setOpen(false);
    setSearchQuery("");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="w-full rtl">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between text-right"
          >
            {searchQuery || "البحث عن مستخدم..."}
            <ChevronsUpDown className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command dir="rtl">
            <CommandInput 
              placeholder="ابحث عن مستخدم..." 
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="text-right"
            />
            <CommandList>
              <CommandEmpty>
                {isLoading ? "جاري البحث..." : "لا توجد نتائج"}
              </CommandEmpty>
              <CommandGroup>
                {users.map((user) => (
                  <CommandItem
                    key={user.id}
                    value={user.id}
                    onSelect={() => handleSelect(user)}
                    className="text-right"
                  >
                    <Avatar className="h-6 w-6 ml-2">
                      {user.avatar_url ? (
                        <AvatarImage src={user.avatar_url} alt={user.display_name} />
                      ) : (
                        <AvatarFallback>{getInitials(user.display_name)}</AvatarFallback>
                      )}
                    </Avatar>
                    <span className="flex-1">{user.display_name}</span>
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedUsers.some(selected => selected.id === user.id)
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
