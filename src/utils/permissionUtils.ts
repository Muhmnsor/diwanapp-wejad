
import { supabase } from "@/integrations/supabase/client";

/**
 * Checks if a user has a specific permission
 * @param userId The user ID to check
 * @param appName The application name (module)
 * @param permissionName The specific permission name
 * @returns Promise resolving to boolean indicating if user has permission
 */
export const checkUserPermission = async (
  userId: string,
  appName: string,
  permissionName: string
): Promise<boolean> => {
  try {
    // Special case for admin or developer roles
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role_id, roles(name)')
      .eq('user_id', userId);
    
    if (rolesError) {
      console.error('Error checking user roles:', rolesError);
      return false;
    }

    // Check for admin/developer role which have all permissions
    for (const role of roles || []) {
      const roleName = typeof role.roles === 'object' && role.roles !== null ? 
        (Array.isArray(role.roles) ? role.roles[0]?.name : (role.roles as any).name) : 
        null;
        
      if (roleName === 'admin' || roleName === 'app_admin' || roleName === 'developer') {
        return true;
      }
    }

    // Check specific permission
    const { data, error } = await supabase.rpc('check_user_permission', {
      p_user_id: userId,
      p_app_name: appName,
      p_permission_name: permissionName
    });

    if (error) {
      console.error('Error checking permission:', error);
      return false;
    }

    return data === true;
  } catch (error) {
    console.error('Error in checkUserPermission:', error);
    return false;
  }
};

/**
 * Gets all permissions for a user
 * @param userId The user ID
 * @returns Promise resolving to array of permission objects
 */
export const getUserPermissions = async (userId: string): Promise<{ app: string; permission: string }[]> => {
  try {
    const { data, error } = await supabase.rpc('get_user_permissions', {
      p_user_id: userId
    });

    if (error) {
      console.error('Error getting user permissions:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getUserPermissions:', error);
    return [];
  }
};
