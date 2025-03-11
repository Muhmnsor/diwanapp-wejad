
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "../../types";

export const useUsersList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('id, display_name, email')
          .eq('is_active', true)
          .order('display_name', { ascending: true });
        
        if (error) {
          throw error;
        }
        
        setUsers(data || []);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("فشل في تحميل قائمة المستخدمين");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  return { users, isLoading, error };
};
