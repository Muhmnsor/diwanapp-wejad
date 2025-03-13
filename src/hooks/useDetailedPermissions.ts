
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/refactored-auth";
import { toast } from "sonner";

// Define permission types
export type Permission = {
  app: string;
  permission: string;
};

export const useDetailedPermissions = () => {
  const { user } = useAuthStore();

  // Fetch all permissions for the current user
  const { data: permissions, isLoading, error } = useQuery({
    queryKey: ['user-detailed-permissions', user?.id],
    queryFn: async (): Promise<Permission[]> => {
      if (!user?.id) return [];
      
      try {
        const { data, error } = await supabase.rpc('get_user_permissions', {
          p_user_id: user.id
        });
        
        if (error) throw error;
        return data || [];
      } catch (err) {
        console.error('Error fetching user permissions:', err);
        toast.error('فشل في تحميل صلاحيات المستخدم');
        return [];
      }
    },
    enabled: !!user?.id,
  });

  // Function to check if user has a specific permission
  const hasPermission = (permissionName: string): boolean => {
    if (!permissions || permissions.length === 0) return false;
    
    // Admin/Developer users have all permissions
    if (user?.isAdmin || user?.role === 'developer') return true;
    
    // Check if the user has the specific permission
    return permissions.some(p => p.permission === permissionName);
  };

  // Function to check multiple permissions (any)
  const hasAnyPermission = (permissionNames: string[]): boolean => {
    return permissionNames.some(permission => hasPermission(permission));
  };

  // Function to check multiple permissions (all)
  const hasAllPermissions = (permissionNames: string[]): boolean => {
    return permissionNames.every(permission => hasPermission(permission));
  };

  return {
    permissions,
    isLoading,
    error,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions
  };
};
