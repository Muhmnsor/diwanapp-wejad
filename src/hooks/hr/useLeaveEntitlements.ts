
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface LeaveEntitlement {
  id: string;
  employee_id: string;
  leave_type_id: string;
  year: number;
  entitled_days: number;
  used_days: number;
  remaining_days: number;
  leave_type?: {
    name: string;
    code: string;
  };
}

export function useLeaveEntitlements(employeeId?: string) {
  const currentYear = new Date().getFullYear();
  
  return useQuery({
    queryKey: ["leave-entitlements", employeeId, currentYear],
    queryFn: async () => {
      if (!employeeId) return [];
      
      const { data, error } = await supabase
        .from("hr_leave_entitlements")
        .select(`
          id,
          employee_id,
          leave_type_id,
          year,
          entitled_days,
          used_days,
          remaining_days,
          leave_type:leave_type_id(name, code)
        `)
        .eq("employee_id", employeeId)
        .eq("year", currentYear);

      if (error) {
        console.error("Error fetching leave entitlements:", error);
        throw error;
      }

      return data as LeaveEntitlement[];
    },
    enabled: !!employeeId,
  });
}
