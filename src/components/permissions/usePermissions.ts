
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/refactored-auth";

interface Permission {
  app: string;
  permission: string;
}

export const usePermissions = () => {
  const { user } = useAuthStore();
  
  const { data: permissions = [], isLoading, error } = useQuery({
    queryKey: ['user-permissions'],
    queryFn: async () => {
      try {
        if (!user?.id) return [];
        
        const { data, error } = await supabase.rpc('get_user_permissions', {
          p_user_id: user.id
        });
        
        if (error) throw error;
        return data as Permission[];
      } catch (err) {
        console.error('Error loading permissions:', err);
        return [];
      }
    },
    enabled: !!user?.id
  });
  
  const hasPermission = (app: string, permission: string): boolean => {
    if (!user) return false;
    
    // Admins have all permissions
    if (user.isAdmin) return true;
    
    // Check for specific permission
    return permissions.some(p => 
      p.app === app && p.permission === permission
    );
  };
  
  // Check if user has any permissions for an app
  const hasAppAccess = (app: string): boolean => {
    if (!user) return false;
    
    // Admins have access to all apps
    if (user.isAdmin) return true;
    
    // Check for any permissions for this app
    return permissions.some(p => p.app === app);
  };
  
  // Get all apps the user has access to
  const getUserApps = (): string[] => {
    if (!user) return [];
    
    return [...new Set(permissions.map(p => p.app))];
  };
  
  return {
    permissions,
    isLoading,
    error,
    hasPermission,
    hasAppAccess,
    getUserApps
  };
};
