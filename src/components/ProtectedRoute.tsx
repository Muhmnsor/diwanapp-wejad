import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/auth/authStore";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requirePermission?: string;
}

const ProtectedRoute = ({ 
  children, 
  requireAdmin = false,
  requirePermission 
}: ProtectedRouteProps) => {
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();

  // Check for app permissions if required
  const { data: permissions, isLoading: isCheckingPermissions } = useQuery({
    queryKey: ['app-permissions', user?.id, requirePermission],
    queryFn: async () => {
      if (!requirePermission || !user) return null;

      console.log('Checking permissions for:', { user: user.id, permission: requirePermission });
      
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role_id')
        .eq('user_id', user.id);

      if (!userRoles?.length) return false;

      const { data: permissions } = await supabase
        .from('app_permissions')
        .select('*')
        .in('role_id', userRoles.map(ur => ur.role_id))
        .eq('app_name', requirePermission);

      console.log('Permission check result:', { permissions });
      return permissions && permissions.length > 0;
    },
    enabled: !!requirePermission && !!user
  });

  console.log('Protected route check:', { 
    isAuthenticated, 
    user, 
    pathname: location.pathname,
    requireAdmin,
    requirePermission,
    hasPermission: permissions
  });

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // If checking permissions, show loading or placeholder
  if (requirePermission && isCheckingPermissions) {
    return <div>جاري التحقق من الصلاحيات...</div>;
  }

  // Check for admin-only routes
  if (requireAdmin && !user?.isAdmin) {
    console.log('User is not admin, redirecting from:', location.pathname);
    return <Navigate to="/dashboard" replace />;
  }

  // Check for permission-required routes
  if (requirePermission && !permissions) {
    console.log('User lacks permission:', requirePermission);
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;