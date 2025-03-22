
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface User {
  id: string;
  display_name: string;
  email: string;
  phone?: string;
}

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async (): Promise<User[]> => {
      console.log("Fetching users for participant selection");
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, email, phone')
        .order('display_name', { ascending: true });
      
      if (error) {
        console.error("Error fetching users:", error);
        throw error;
      }

      console.log(`Retrieved ${data.length} users`);
      return data as User[];
    }
  });
};
