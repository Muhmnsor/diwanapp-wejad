
import { supabase } from "@/integrations/supabase/client";
import { hasPermission } from "@/utils/permissions/permissionChecker";

/**
 * Check if the current user has a specific permission by name
 * @param permissionName The permission name to check
 * @returns Promise<boolean> True if the user has permission, false otherwise
 */
export async function checkUserPermission(permissionName: string): Promise<boolean> {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log("No authenticated user found");
      return false;
    }
    
    // Check for admin users - they get all permissions
    const { data: isAdmin } = await supabase.rpc('is_admin_user', {
      user_id: user.id
    });
    
    if (isAdmin) {
      console.log("User is admin, granting permission automatically");
      return true;
    }
    
    // Check the specific permission
    return await hasPermission(user.id, permissionName);
  } catch (error) {
    console.error("Error checking permission:", error);
    return false;
  }
}

/**
 * Get all permissions for the current user
 * @returns Promise<string[]> Array of permission names
 */
export async function getCurrentUserPermissions(): Promise<string[]> {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log("No authenticated user found");
      return [];
    }
    
    // Get user permissions
    const { data, error } = await supabase.rpc('get_user_permissions', {
      p_user_id: user.id
    });
    
    if (error) {
      console.error("Error fetching user permissions:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Error getting permissions:", error);
    return [];
  }
}
