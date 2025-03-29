
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
        // Check if user has HR role
        const { data: hasHRAccess, error: hrError } = await supabase
          .rpc('has_hr_access', { user_id: user.id });
          
        if (hrError) throw hrError;
        
        // Check if user is admin
        const { data: isAdmin, error: adminError } = await supabase
          .rpc('is_admin', { user_id: user.id });
          
        if (adminError) throw adminError;
        
        return {
          canViewHR: hasHRAccess || isAdmin,
          canManageEmployees: hasHRAccess || isAdmin,
          canManageAttendance: hasHRAccess || isAdmin,
          canManageLeaves: hasHRAccess || isAdmin,
          canManageTraining: hasHRAccess || isAdmin,
          canManageCompensation: hasHRAccess || isAdmin,
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
