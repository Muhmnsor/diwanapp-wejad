
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useEmployees() {
  return useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      console.log("useEmployees - Fetching employees with schedule information");
      const { data, error } = await supabase
        .from('employees')
        .select('*, schedule_id')
        .order('full_name');
        
      if (error) {
        console.error("useEmployees - Error fetching employees:", error);
        throw error;
      }
      
      console.log(`useEmployees - Retrieved ${data?.length || 0} employees`);
      return data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
