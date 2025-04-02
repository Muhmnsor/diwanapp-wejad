
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Employee {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  position?: string;
  join_date?: string;
  is_active: boolean;
}

export function useEmployees() {
  return useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('full_name');
        
      if (error) {
        console.error("Error fetching employees:", error);
        throw error;
      }
      
      return data as Employee[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
