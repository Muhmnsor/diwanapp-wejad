
import { useAuthStore } from "@/store/refactored-auth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Custom hook to check permissions
export const usePermissionCheck = (permissionName: string) => {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['permission', user?.id, permissionName],
    queryFn: async () => {
      if (!user || !permissionName) return false;

      try {
        const { data: hasPermission, error } = await supabase
          .from('role_permissions')
          .select(`
            roles!inner(
              user_roles!inner(user_id),
              id
            ),
            permissions!inner(name)
          `)
          .eq('roles.user_roles.user_id', user.id)
          .eq('permissions.name', permissionName)
          .maybeSingle();

        if (error) {
          console.error('Permission check error:', error);
          return false;
        }

        return !!hasPermission;
      } catch (error) {
        console.error('Permission check failed:', error);
        return false;
      }
    },
    enabled: !!user && !!permissionName,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};

// Component wrapper for permission-based rendering
export const withPermission = (
  Component: React.ComponentType<any>,
  requiredPermission: string,
  FallbackComponent?: React.ComponentType<any>
) => {
  return (props: any) => {
    const { data: hasPermission, isLoading } = usePermissionCheck(requiredPermission);

    if (isLoading) {
      return null; // Or a loading component
    }

    if (!hasPermission) {
      return FallbackComponent ? <FallbackComponent {...props} /> : null;
    }

    return <Component {...props} />;
  };
};
