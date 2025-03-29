
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/refactored-auth";

export type AppName = 'hr' | 'accounting' | 'meetings' | 'tasks' | 'documents';

export function useAppPermissions() {
  const { user } = useAuthStore();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['app-permissions', user?.id],
    queryFn: async () => {
      if (!user) {
        return {
          hasHRAccess: false,
          hasAccountingAccess: false,
          hasMeetingsAccess: false,
          hasTasksAccess: false, 
          hasDocumentsAccess: false,
          isAdmin: false
        };
      }
      
      try {
        // Check if user is admin
        const { data: isAdmin, error: adminError } = await supabase
          .rpc('is_admin', { user_id: user.id });
          
        if (adminError) throw adminError;
        
        // If user is admin, they have access to all apps
        if (isAdmin) {
          return {
            hasHRAccess: true,
            hasAccountingAccess: true,
            hasMeetingsAccess: true,
            hasTasksAccess: true,
            hasDocumentsAccess: true,
            isAdmin: true
          };
        }
        
        // Check specific app permissions
        const [hrAccess, accountingAccess, meetingsAccess, tasksAccess, documentsAccess] = await Promise.all([
          supabase.rpc('check_user_app_access', { 
            p_user_id: user.id,
            p_app_name: 'hr'
          }),
          supabase.rpc('check_user_app_access', { 
            p_user_id: user.id,
            p_app_name: 'accounting'
          }),
          supabase.rpc('check_user_app_access', { 
            p_user_id: user.id,
            p_app_name: 'meetings'
          }),
          supabase.rpc('check_user_app_access', { 
            p_user_id: user.id,
            p_app_name: 'tasks'
          }),
          supabase.rpc('check_user_app_access', { 
            p_user_id: user.id,
            p_app_name: 'documents'
          })
        ]);
        
        return {
          hasHRAccess: !!hrAccess.data,
          hasAccountingAccess: !!accountingAccess.data,
          hasMeetingsAccess: !!meetingsAccess.data,
          hasTasksAccess: !!tasksAccess.data,
          hasDocumentsAccess: !!documentsAccess.data,
          isAdmin: false
        };
      } catch (error) {
        console.error('Error checking app permissions:', error);
        return {
          hasHRAccess: false,
          hasAccountingAccess: false,
          hasMeetingsAccess: false,
          hasTasksAccess: false,
          hasDocumentsAccess: false,
          isAdmin: false
        };
      }
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5 // Cache for 5 minutes
  });
  
  // Generic function to check permission for any app
  const hasAppAccess = async (appName: AppName): Promise<boolean> => {
    if (!user) return false;
    
    // If we already have the data loaded, use it
    if (data) {
      switch (appName) {
        case 'hr': return data.hasHRAccess || data.isAdmin;
        case 'accounting': return data.hasAccountingAccess || data.isAdmin;
        case 'meetings': return data.hasMeetingsAccess || data.isAdmin;
        case 'tasks': return data.hasTasksAccess || data.isAdmin;
        case 'documents': return data.hasDocumentsAccess || data.isAdmin;
        default: return data.isAdmin;
      }
    }
    
    // Otherwise fetch directly
    try {
      // Check if user is admin first
      const { data: isAdmin, error: adminError } = await supabase
        .rpc('is_admin', { user_id: user.id });
        
      if (adminError) throw adminError;
      if (isAdmin) return true;
      
      // Check app permission
      const { data: hasAccess, error } = await supabase
        .rpc('check_user_app_access', { 
          p_user_id: user.id,
          p_app_name: appName
        });
        
      if (error) throw error;
      return !!hasAccess;
    } catch (error) {
      console.error(`Error checking ${appName} access:`, error);
      return false;
    }
  };
  
  return {
    ...data,
    isLoading,
    error,
    hasAppAccess
  };
}
