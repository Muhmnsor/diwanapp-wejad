
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
        // Check if user has admin role first (they have all permissions)
        const { data: isAdmin, error: adminError } = await supabase
          .rpc('is_admin', { user_id: user.id });
          
        if (adminError) throw adminError;
        
        if (isAdmin) {
          // Admin users automatically have all HR permissions
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
        
        // For non-admin users, check specific HR access
        const { data: userRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select(`
            role_id,
            roles:role_id (
              name
            )
          `)
          .eq('user_id', user.id);
          
        if (rolesError) throw rolesError;
        
        // Check if user has hr_manager role
        const hasHRRole = userRoles?.some(userRole => {
          if (userRole.roles && typeof userRole.roles === 'object') {
            const roleName = userRole.roles as unknown as { name: string };
            return roleName.name === 'hr_manager';
          }
          return false;
        });
        
        return {
          canViewHR: hasHRRole || isAdmin,
          canManageEmployees: hasHRRole || isAdmin,
          canManageAttendance: hasHRRole || isAdmin,
          canManageLeaves: hasHRRole || isAdmin,
          canManageTraining: hasHRRole || isAdmin,
          canManageCompensation: hasHRRole || isAdmin,
          isAdmin
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
