
import { useAuthStore } from "@/store/refactored-auth";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export const usePermissionCheck = (permissionName: string) => {
  const { user } = useAuthStore();
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkPermission = async () => {
      if (!user?.id) {
        setHasPermission(false);
        setIsLoading(false);
        return;
      }

      try {
        // Use the Supabase function to check if the user has this permission
        const { data, error } = await supabase.rpc('has_permission', {
          p_user_id: user.id,
          p_permission_name: permissionName
        });

        if (error) {
          console.error('Error checking permission:', error);
          setHasPermission(false);
        } else {
          setHasPermission(!!data);
        }
      } catch (error) {
        console.error('Permission check error:', error);
        setHasPermission(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkPermission();
  }, [user?.id, permissionName]);

  return { hasPermission, isLoading };
};

export const withPermission = <P extends object>(
  Component: React.ComponentType<P>,
  requiredPermission: string,
  FallbackComponent?: React.ComponentType<P>
) => {
  const WithPermissionCheck = (props: P) => {
    const { hasPermission, isLoading } = usePermissionCheck(requiredPermission);

    if (isLoading) {
      return <div className="flex justify-center py-4">جاري التحقق من الصلاحيات...</div>;
    }

    if (!hasPermission) {
      if (FallbackComponent) {
        return <FallbackComponent {...props} />;
      }
      return (
        <div className="p-4 text-center">
          <p className="text-destructive">ليس لديك صلاحية للوصول إلى هذه الميزة</p>
        </div>
      );
    }

    return <Component {...props} />;
  };

  return WithPermissionCheck;
};

// Utility to check if user has any of the given permissions
export const checkAnyPermission = async (userId: string, permissionNames: string[]): Promise<boolean> => {
  if (!userId || permissionNames.length === 0) return false;
  
  try {
    // Fetch all user permissions
    const { data, error } = await supabase.rpc('get_user_permissions', {
      p_user_id: userId
    });
    
    if (error) {
      console.error('Error fetching user permissions:', error);
      return false;
    }
    
    // Check if user has any of the required permissions
    return permissionNames.some(permission => data.includes(permission));
  } catch (error) {
    console.error('Permission check error:', error);
    return false;
  }
};

// Check for multiple permissions at once
export const checkPermissions = async (userId: string, permissionNames: string[]): Promise<{[key: string]: boolean}> => {
  const result: {[key: string]: boolean} = {};
  
  if (!userId || permissionNames.length === 0) {
    return permissionNames.reduce((acc, perm) => ({...acc, [perm]: false}), {});
  }
  
  try {
    // Fetch all user permissions
    const { data, error } = await supabase.rpc('get_user_permissions', {
      p_user_id: userId
    });
    
    if (error) {
      console.error('Error fetching user permissions:', error);
      return permissionNames.reduce((acc, perm) => ({...acc, [perm]: false}), {});
    }
    
    // Check each permission
    for (const permission of permissionNames) {
      result[permission] = data.includes(permission);
    }
    
    return result;
  } catch (error) {
    console.error('Permissions check error:', error);
    return permissionNames.reduce((acc, perm) => ({...acc, [perm]: false}), {});
  }
};
