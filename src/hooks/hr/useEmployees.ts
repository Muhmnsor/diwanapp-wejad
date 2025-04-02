
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useEmployees() {
  return useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      // Include schedule_id in the query to properly fetch employee schedules
      const { data, error } = await supabase
        .from('employees')
        .select('*, schedule_id')
        .order('full_name');
        
      if (error) throw error;
      return data || [];
    }
  });
}
