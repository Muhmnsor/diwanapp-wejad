
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Employee {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  position?: string;
  department?: string;
  gender?: string;
  status?: string;
  hire_date?: string;
  employee_number?: string;
}

export function useEmployees() {
  return useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .eq("status", "active")
        .order("full_name");

      if (error) {
        console.error("Error fetching employees:", error);
        throw error;
      }

      return data as Employee[];
    },
  });
}
