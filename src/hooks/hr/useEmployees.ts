
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useEmployees() {
  return useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('full_name', { ascending: true });
      
      if (error) {
        throw new Error(`Error fetching employees: ${error.message}`);
      }
      
      return data || [];
    }
  });
}
