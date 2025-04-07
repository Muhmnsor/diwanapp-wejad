
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface LeaveBalance {
  leaveTypeId: string;
  leaveTypeName: string;
  entitledDays: number;
  usedDays: number;
  remainingDays: number;
  year: number;
}

export function useLeaveBalance(employeeId: string | undefined) {
  const currentYear = new Date().getFullYear();
  
  return useQuery({
    queryKey: ["leave-balance", employeeId, currentYear],
    queryFn: async (): Promise<Record<string, LeaveBalance>> => {
      if (!employeeId) return {};
      
      // Step 1: Get all leave types
      const { data: leaveTypes, error: typesError } = await supabase
        .from("hr_leave_types")
        .select("*")
        .eq("is_active", true);

      if (typesError) {
        console.error("Error fetching leave types:", typesError);
        throw typesError;
      }
      
      // Step 2: Get existing entitlements for this employee and year
      const { data: entitlements, error: entitlementsError } = await supabase
        .from("hr_leave_entitlements")
        .select(`
          *,
          leave_type:leave_type_id(name, code, max_days)
        `)
        .eq("employee_id", employeeId)
        .eq("year", currentYear);

      if (entitlementsError) {
        console.error("Error fetching leave entitlements:", entitlementsError);
        throw entitlementsError;
      }
      
      // Step 3: Create a map to track all leave types and balances
      const balanceMap: Record<string, LeaveBalance> = {};
      
      // Add all leave types with default values
      leaveTypes.forEach(type => {
        balanceMap[type.id] = {
          leaveTypeId: type.id,
          leaveTypeName: type.name,
          entitledDays: type.max_days || 0,
          usedDays: 0,
          remainingDays: type.max_days || 0,
          year: currentYear
        };
      });
      
      // Update with actual entitlement data if available
      entitlements.forEach(entitlement => {
        if (balanceMap[entitlement.leave_type_id]) {
          balanceMap[entitlement.leave_type_id] = {
            leaveTypeId: entitlement.leave_type_id,
            leaveTypeName: entitlement.leave_type.name,
            entitledDays: entitlement.entitled_days,
            usedDays: entitlement.used_days,
            remainingDays: entitlement.remaining_days,
            year: entitlement.year
          };
        }
      });
      
      return balanceMap;
    },
    enabled: !!employeeId,
  });
}
