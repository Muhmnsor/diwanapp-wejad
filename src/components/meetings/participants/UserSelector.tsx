
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Loader2, Check, ChevronsUpDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  email?: string;
  display_name?: string;
}

interface UserSelectorProps {
  value: string;
  onChange: (userId: string, userData?: User) => void;
}

export const UserSelector = ({ value, onChange }: UserSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('id, email, display_name')
          .eq('is_active', true)
          .order('display_name', { ascending: true });
        
        if (error) throw error;
        
        setUsers(data || []);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('حدث خطأ أثناء تحميل قائمة المستخدمين');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true;
    
    const search = searchTerm.toLowerCase();
    return (
      (user.display_name && user.display_name.toLowerCase().includes(search)) ||
      (user.email && user.email.toLowerCase().includes(search))
    );
  });

  const selectedUser = users.find(user => user.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value && selectedUser
            ? selectedUser.display_name || selectedUser.email
            : "اختر مستخدم..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command className="w-full">
          <div className="flex items-center border-b px-3">
            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput
              placeholder="ابحث عن مستخدم..."
              className="flex h-11 w-full text-right"
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
          </div>
          {isLoading ? (
            <div className="py-6 text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto" />
              <p className="mt-2 text-sm text-muted-foreground">جاري تحميل المستخدمين...</p>
            </div>
          ) : error ? (
            <div className="py-6 text-center">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          ) : (
            <CommandList>
              {filteredUsers.length === 0 ? (
                <CommandEmpty>لا توجد نتائج</CommandEmpty>
              ) : (
                <CommandGroup>
                  {filteredUsers.map((user) => (
                    <CommandItem
                      key={user.id}
                      value={user.id}
                      onSelect={() => {
                        onChange(user.id, user);
                        setOpen(false);
                      }}
                      className="text-right flex justify-between items-center"
                    >
                      <div className="flex flex-col">
                        <span>{user.display_name || 'بدون اسم'}</span>
                        {user.email && (
                          <span className="text-xs text-muted-foreground">{user.email}</span>
                        )}
                      </div>
                      {value === user.id && <Check className="h-4 w-4" />}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
};
