
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export interface Employee {
  id: string;
  user_id: string | null;
  employee_number: string | null;
  full_name: string;
  position: string | null;
  department: string | null;
  hire_date: string | null;
  contract_type: string | null;
  contract_end_date: string | null;
  email: string | null;
  phone: string | null;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
  schedule_id: string | null;
}

export function useEmployees() {
  return useQuery<Employee[], Error>({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .order("full_name");
        
      if (error) throw error;
      return data || [];
    },
  });
}
