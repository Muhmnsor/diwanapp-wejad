
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Employee {
  id: string;
  full_name: string;
  job_title?: string;
  department?: string;
  email?: string;
}

export function useEmployees() {
  return useQuery({
    queryKey: ["employees"],
    queryFn: async (): Promise<Employee[]> => {
      console.log("Fetching employees for selector");
      
      const { data, error } = await supabase
        .from("employees")
        .select("id, full_name, job_title, department, email")
        .order("full_name");
      
      if (error) {
        console.error("Error fetching employees:", error);
        throw error;
      }
      
      return data || [];
    },
  });
}
