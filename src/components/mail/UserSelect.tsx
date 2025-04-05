
import React, { useState, useEffect } from "react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  name: string;
  email?: string;
}

interface UserSelectProps {
  value: User[];
  onChange: (value: User[]) => void;
  placeholder?: string;
  className?: string;
}

export const UserSelect: React.FC<UserSelectProps> = ({
  value,
  onChange,
  placeholder = "اختر المستخدمين...",
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // البحث عن المستخدمين
  useEffect(() => {
    if (!open) return;

    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        let query = supabase
          .from("profiles")
          .select("id, display_name, email")
          .limit(10);
        
        if (search) {
          query = query.ilike("display_name", `%${search}%`);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        setUsers(
          data.map((user) => ({
            id: user.id,
            name: user.display_name || user.email || "مستخدم",
            email: user.email,
          }))
        );
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [open, search]);

  const handleSelect = (user: User) => {
    // تجنب الازدواجية
    if (value.some((v) => v.id === user.id)) return;
    onChange([...value, user]);
    setSearch("");
  };

  const handleRemove = (userId: string) => {
    onChange(value.filter((v) => v.id !== userId));
  };

  return (
    <div className={cn("relative", className)}>
      <div
        className="flex flex-wrap gap-1 p-2 min-h-10 border rounded-md bg-background cursor-text"
        onClick={() => setOpen(true)}
      >
        {value.map((user) => (
          <Badge
            key={user.id}
            variant="secondary"
            className="px-2 py-1 flex items-center gap-1"
          >
            {user.name}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove(user.id);
              }}
              className="rounded-full hover:bg-gray-200 h-4 w-4 inline-flex items-center justify-center"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="outline-none flex-1 min-w-[120px] bg-transparent text-sm"
          placeholder={value.length === 0 ? placeholder : ""}
          onFocus={() => setOpen(true)}
        />
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command dir="rtl" className="rounded-lg p-0">
          <CommandInput 
            placeholder="ابحث عن مستخدم..." 
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>لا توجد نتائج مطابقة</CommandEmpty>
            <CommandGroup>
              {isLoading ? (
                <div className="p-2 text-sm text-center">جاري البحث...</div>
              ) : (
                users
                  .filter(user => !value.some(v => v.id === user.id))
                  .map((user) => (
                    <CommandItem
                      key={user.id}
                      onSelect={() => handleSelect(user)}
                      className="cursor-pointer"
                    >
                      <div className="mr-2 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span>{user.name}</span>
                        {user.email && (
                          <span className="text-xs text-gray-500">{user.email}</span>
                        )}
                      </div>
                    </CommandItem>
                  ))
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </div>
  );
};
