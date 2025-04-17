
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/refactored-auth";

export interface LeaveEntitlement {
  id: string;
  employee_id: string;
  leave_type_id: string;
  year: number;
  total_days: number;
  used_days: number;
  remaining_days: number;
  leave_type?: {
    name: string;
    code: string;
  };
}

export function useLeaveEntitlements() {
  const { user } = useAuthStore();
  const currentYear = new Date().getFullYear();
  
  return useQuery({
    queryKey: ["leave-entitlements", user?.id, currentYear],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data: employeeData, error: employeeError } = await supabase
        .from("employees")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (employeeError) {
        console.error("Error fetching employee:", employeeError);
        throw employeeError;
      }

      if (!employeeData) {
        console.log("No employee found for user");
        return [];
      }

      const { data, error } = await supabase
        .from("hr_leave_entitlements")
        .select(`
          *,
          leave_type:leave_type_id(name, code)
        `)
        .eq("employee_id", employeeData.id)
        .eq("year", currentYear);

      if (error) {
        console.error("Error fetching leave entitlements:", error);
        throw error;
      }

      return data as LeaveEntitlement[];
    },
    enabled: !!user?.id,
  });
}
