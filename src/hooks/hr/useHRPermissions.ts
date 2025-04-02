
import { useAuthStore } from "@/store/refactored-auth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useHRPermissions() {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: ['hr-permissions', user?.id],
    queryFn: async () => {
      if (!user) {
        return {
          canViewHR: false,
          canManageEmployees: false,
          canManageAttendance: false,
          canManageLeaves: false,
          canManageTraining: false,
          canManageCompensation: false,
          isAdmin: false
        };
      }
      
      try {
        // Check if user is admin, app_admin, or developer (they get all HR permissions)
        const { data: isAdmin, error: adminError } = await supabase
          .rpc('is_admin', { user_id: user.id });
          
        if (adminError) {
          console.error('Error checking admin status:', adminError);
          throw adminError;
        }
        
        // Check if user is a developer explicitly
        const { data: isDeveloper, error: devError } = await supabase
          .rpc('has_developer_role', { p_user_id: user.id });
        
        if (devError) {
          console.error('Error checking developer status:', devError);
          // Don't throw, continue checking other permissions
        }
        
        // If user is admin or developer, they have all permissions
        if (isAdmin || isDeveloper) {
          console.log('User is admin/developer, granting all HR permissions');
          return {
            canViewHR: true,
            canManageEmployees: true,
            canManageAttendance: true,
            canManageLeaves: true,
            canManageTraining: true,
            canManageCompensation: true,
            isAdmin: true
          };
        }
        
        // If not admin or developer, check for specific HR access
        const { data: hasHRAccess, error: hrError } = await supabase
          .rpc('has_hr_access', { user_id: user.id });
          
        if (hrError) throw hrError;
        
        return {
          canViewHR: !!hasHRAccess,
          canManageEmployees: !!hasHRAccess,
          canManageAttendance: !!hasHRAccess,
          canManageLeaves: !!hasHRAccess,
          canManageTraining: !!hasHRAccess,
          canManageCompensation: !!hasHRAccess,
          isAdmin: false
        };
      } catch (error) {
        console.error('Error checking HR permissions:', error);
        return {
          canViewHR: false,
          canManageEmployees: false,
          canManageAttendance: false,
          canManageLeaves: false,
          canManageTraining: false,
          canManageCompensation: false,
          isAdmin: false
        };
      }
    },
    enabled: !!user
  });
}
