
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface HRPermissions {
  canManageEmployees: boolean;
  canViewReports: boolean;
  canManageAttendance: boolean;
  isAdmin: boolean;
}

export function useHRPermissions() {
  return useQuery({
    queryKey: ['hr-permissions'],
    queryFn: async (): Promise<HRPermissions> => {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user || !user.user) {
        return {
          canManageEmployees: false,
          canViewReports: false,
          canManageAttendance: false,
          isAdmin: false
        };
      }
      
      // Check if user has admin role
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select(`
          role_id,
          roles:role_id (
            name
          )
        `)
        .eq('user_id', user.user.id);
      
      if (rolesError) {
        console.error("Error checking user roles:", rolesError);
        return {
          canManageEmployees: false,
          canViewReports: false,
          canManageAttendance: false,
          isAdmin: false
        };
      }
      
      const isAdmin = userRoles?.some(
        role => role.roles?.name === 'admin' || 
               role.roles?.name === 'app_admin' || 
               role.roles?.name === 'developer'
      ) || false;
      
      // If admin, grant all permissions
      if (isAdmin) {
        return {
          canManageEmployees: true,
          canViewReports: true,
          canManageAttendance: true,
          isAdmin: true
        };
      }
      
      // Check for specific HR permissions
      const { data: permissions, error: permError } = await supabase
        .from('user_permissions')
        .select('permission')
        .eq('user_id', user.user.id)
        .in('permission', ['hr.manage_employees', 'hr.view_reports', 'hr.manage_attendance']);
      
      if (permError) {
        console.error("Error checking user permissions:", permError);
      }
      
      return {
        canManageEmployees: permissions?.some(p => p.permission === 'hr.manage_employees') || false,
        canViewReports: permissions?.some(p => p.permission === 'hr.view_reports') || false,
        canManageAttendance: permissions?.some(p => p.permission === 'hr.manage_attendance') || false,
        isAdmin: false
      };
    }
  });
}
