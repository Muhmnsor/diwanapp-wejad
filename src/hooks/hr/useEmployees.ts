
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useEmployees() {
  return useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      // Remove the status filter if that field doesn't exist
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('full_name');
        
      if (error) throw error;
      return data || [];
    }
  });
}
