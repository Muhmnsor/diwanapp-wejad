
import { useState, useEffect } from "react";
import { User } from "../../types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useUsersList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log("[useUsersList] Fetching active users from profiles table");
        
        const { data, error } = await supabase
          .from('profiles')
          .select('id, display_name, email')
          .eq('is_active', true);

        if (error) {
          console.error("[useUsersList] Error fetching users:", error);
          throw error;
        }
        
        console.log("[useUsersList] Fetched users:", data);
        
        const formattedUsers = data.map(user => ({
          id: user.id,
          display_name: user.display_name || user.email || 'مستخدم',
          email: user.email
        }));
        
        console.log("[useUsersList] Formatted users:", formattedUsers);
        setUsers(formattedUsers);
      } catch (error) {
        console.error('[useUsersList] Error fetching users:', error);
        toast.error('فشل في جلب قائمة المستخدمين');
        setError('فشل في جلب قائمة المستخدمين');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return { users, isLoading, error };
};
