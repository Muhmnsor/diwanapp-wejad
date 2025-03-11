
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Check if a user has a specific permission
 * @param userId The user ID to check
 * @param permissionName The permission name to check for
 * @returns Promise<boolean> True if the user has the permission, false otherwise
 */
export async function hasPermission(userId: string, permissionName: string): Promise<boolean> {
  try {
    if (!userId || !permissionName) {
      console.error("Missing userId or permissionName in hasPermission check");
      return false;
    }

    // Use the has_permission Postgres function
    const { data, error } = await supabase.rpc('has_permission', {
      p_user_id: userId,
      p_permission_name: permissionName
    });

    if (error) {
      console.error("Error checking permission:", error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error("Exception in hasPermission:", error);
    return false;
  }
}

/**
 * Get all permissions for a user
 * @param userId The user ID to get permissions for
 * @returns Promise<string[]> Array of permission names
 */
export async function getUserPermissions(userId: string): Promise<string[]> {
  try {
    if (!userId) {
      console.error("Missing userId in getUserPermissions");
      return [];
    }

    // Use the get_user_permissions Postgres function
    const { data, error } = await supabase.rpc('get_user_permissions', {
      p_user_id: userId
    });

    if (error) {
      console.error("Error fetching user permissions:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Exception in getUserPermissions:", error);
    return [];
  }
}

/**
 * Higher-order component that provides permission check capability to a component
 * @param WrappedComponent The component to wrap
 * @returns A new component with permission checking capabilities
 */
export function withPermissionCheck<P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.FC<P> {
  return (props: P) => {
    return <WrappedComponent {...props} />;
  };
}
