
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types/user";

export const useUsersList = () => {
  return useQuery({
    queryKey: ['users-list'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, display_name, email')
          .eq('is_active', true)
          .order('display_name', { ascending: true });
        
        if (error) {
          throw error;
        }
        
        return (data || []) as User[];
      } catch (err) {
        console.error("Error fetching users:", err);
        throw err;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 دقائق
  });
};
