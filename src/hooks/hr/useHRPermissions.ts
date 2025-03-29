
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
        
        // Check specific app permissions
        const { data: hasHRApp, error: hrAppError } = await supabase
          .rpc('check_user_app_access', { 
            p_user_id: user.id,
            p_app_name: 'hr'
          });
          
        if (hrAppError) throw hrAppError;
        
        const { data: hasAccountingApp, error: accountingAppError } = await supabase
          .rpc('check_user_app_access', { 
            p_user_id: user.id,
            p_app_name: 'accounting'
          });
          
        if (accountingAppError) throw accountingAppError;
        
        const { data: hasMeetingsApp, error: meetingsAppError } = await supabase
          .rpc('check_user_app_access', { 
            p_user_id: user.id,
            p_app_name: 'meetings'
          });
          
        if (meetingsAppError) throw meetingsAppError;
        
        return {
          canViewHR: hasHRAccess || isAdmin || hasHRApp,
          canManageEmployees: hasHRAccess || isAdmin || hasHRApp,
          canManageAttendance: hasHRAccess || isAdmin || hasHRApp,
          canManageLeaves: hasHRAccess || isAdmin || hasHRApp,
          canManageTraining: hasHRAccess || isAdmin || hasHRApp,
          canManageCompensation: hasHRAccess || isAdmin || hasHRApp,
          canAccessAccounting: isAdmin || hasAccountingApp,
          canAccessMeetings: isAdmin || hasMeetingsApp,
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
          canAccessAccounting: false,
          canAccessMeetings: false,
          isAdmin: false
        };
      }
    },
    enabled: !!user
  });
}
