
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/refactored-auth";
import { LeaveEntitlement } from "@/types/hr";
import { useHRPermissions } from "./useHRPermissions";

export function useLeaveEntitlements() {
  const { user } = useAuthStore();
  const { data: permissions } = useHRPermissions();
  
  return useQuery({
    queryKey: ["leave-entitlements", user?.id, permissions?.canManageLeaves, user?.isAdmin],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // If user is admin or has HR permissions, fetch all employees' entitlements
      if (user.isAdmin || permissions?.canManageLeaves) {
        const { data, error } = await supabase
          .from("hr_leave_entitlements")
          .select(`
            *,
            leave_type:leave_type_id(name),
            employee:employee_id(
              id,
              full_name
            )
          `);

        if (error) {
          console.error("Error fetching leave entitlements:", error);
          throw error;
        }

        return data as (LeaveEntitlement & { employee: { full_name: string } })[];
      }

      // For regular employees, fetch only their entitlements
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
          leave_type:leave_type_id(name)
        `)
        .eq("employee_id", employeeData.id);

      if (error) {
        console.error("Error fetching leave entitlements:", error);
        throw error;
      }

      return data as LeaveEntitlement[];
    },
    enabled: !!user?.id,
  });
}
