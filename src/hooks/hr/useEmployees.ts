
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useEmployees() {
  return useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      console.log("Fetching employees data...");
      
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('full_name');
        
      if (error) {
        console.error("Error fetching employees:", error);
        throw error;
      }
      
      console.log("Employees data fetched:", data?.length || 0, "records");
      return data || [];
    }
  });
}
