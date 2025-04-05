
import React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useUsersList } from "@/hooks/mail/useUsersList";
import { User } from "@/types/user";

interface UserSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  type?: 'to' | 'cc' | 'bcc';
  className?: string;
}

export const UserSelect: React.FC<UserSelectProps> = ({
  value,
  onChange,
  placeholder = "اختر مستخدمًا...",
  label,
  disabled = false,
  type = 'to',
  className,
}) => {
  const [open, setOpen] = React.useState(false);
  const { data: users = [], isLoading } = useUsersList();

  const selectedUsers = React.useMemo(() => {
    return users.filter(user => value.includes(user.id));
  }, [users, value]);
  
  const handleSelect = (userId: string) => {
    if (value.includes(userId)) {
      onChange(value.filter((id) => id !== userId));
    } else {
      onChange([...value, userId]);
    }
  };

  const handleRemoveUser = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter((id) => id !== userId));
  };

  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium mb-1">{label}</label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between",
              !value.length && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <div className="flex flex-wrap gap-1 py-1">
              {selectedUsers.length > 0 ? (
                selectedUsers.map((user) => (
                  <Badge 
                    key={user.id} 
                    variant="secondary"
                    className="flex items-center gap-1 px-2"
                  >
                    {user.display_name || user.email}
                    <button
                      type="button"
                      className="ml-1 rounded-full outline-none focus:ring-2"
                      onClick={(e) => handleRemoveUser(user.id, e)}
                    >
                      ×
                    </button>
                  </Badge>
                ))
              ) : (
                <span>{placeholder}</span>
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="ابحث عن مستخدم..." />
            <CommandList>
              {isLoading ? (
                <CommandEmpty>جاري التحميل...</CommandEmpty>
              ) : (
                <>
                  <CommandEmpty>لا يوجد مستخدمين مطابقين</CommandEmpty>
                  <CommandGroup>
                    {users.map((user: User) => (
                      <CommandItem
                        key={user.id}
                        value={user.id}
                        onSelect={() => handleSelect(user.id)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            value.includes(user.id) ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex flex-col">
                          <span>{user.display_name || "مستخدم"}</span>
                          <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
