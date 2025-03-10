import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/refactored-auth";

interface Permission {
  id: string;
  name: string;
  description: string | null;
  module: string;
}

export const useUserPermissions = () => {
  const { user } = useAuthStore();
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all permissions to use later for checking
  const { data: allPermissions = [] } = useQuery({
    queryKey: ['all-permissions'],
    queryFn: async (): Promise<Permission[]> => {
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .order('module');
        
      if (error) {
        console.error('Error fetching permissions:', error);
        throw error;
      }
      
      return data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch user permissions
  useEffect(() => {
    const fetchUserPermissions = async () => {
      if (!user?.id) {
        setUserPermissions([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // If user is admin, they have all permissions
        if (user.isAdmin) {
          const allPermissionNames = allPermissions.map(p => p.name);
          setUserPermissions(allPermissionNames);
          setIsLoading(false);
          return;
        }
        
        // Otherwise, fetch user's role permissions
        const { data: rolePermissions, error } = await supabase
          .from('role_permissions')
          .select(`
            permission_id,
            permissions (
              name
            )
          `)
          .in('role_id', await getUserRoleIds(user.id));
          
        if (error) {
          console.error('Error fetching user permissions:', error);
          throw error;
        }
        
        // Extract permission names
        const permissionNames = rolePermissions.map(rp => {
          // Handle both array and object responses from Supabase
          if (rp.permissions) {
            if (Array.isArray(rp.permissions)) {
              return rp.permissions[0]?.name;
            } else {
              return (rp.permissions as any).name;
            }
          }
          return null;
        }).filter(Boolean) as string[];
        
        setUserPermissions(permissionNames);
      } catch (error) {
        console.error('Error in fetchUserPermissions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserPermissions();
  }, [user, allPermissions]);

  // Get all role IDs for a user
  const getUserRoleIds = async (userId: string): Promise<string[]> => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role_id')
      .eq('user_id', userId);
      
    if (error) {
      console.error('Error fetching user roles:', error);
      return [];
    }
    
    return data.map(r => r.role_id);
  };

  // Helper function to check if user has a specific permission
  const hasPermission = (permissionName: string) => {
    if (isLoading) return false;
    
    // Admin users have all permissions
    if (user?.isAdmin) return true;
    
    return userPermissions.includes(permissionName);
  };

  // Get all permissions for a module
  const getModulePermissions = (moduleName: string) => {
    return allPermissions.filter(p => p.module === moduleName);
  };

  return {
    permissions: userPermissions,
    hasPermission,
    isLoading,
    allPermissions,
    getModulePermissions
  };
};
