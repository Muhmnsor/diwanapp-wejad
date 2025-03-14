
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/refactored-auth";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading, refreshSession, logout } = useAuthStore();
  const location = useLocation();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  useEffect(() => {
    const checkSession = async () => {
      if (!isAuthenticated && !isLoading) {
        setIsRefreshing(true);
        try {
          const isValid = await refreshSession();
          if (!isValid) {
            // If session refresh fails, redirect to login
            console.log('ProtectedRoute: Session refresh failed, redirecting to login');
          }
        } catch (error) {
          console.error('ProtectedRoute: Error refreshing session:', error);
          // If error, try logging out to clear any corrupted state
          try {
            await logout();
          } catch (logoutError) {
            console.error('ProtectedRoute: Error during logout:', logoutError);
          }
        } finally {
          setIsRefreshing(false);
        }
      }
    };

    checkSession();
  }, [isAuthenticated, isLoading, refreshSession, logout]);

  console.log('Protected route check:', { 
    isAuthenticated, 
    user, 
    userIsAdmin: user?.isAdmin,
    userRole: user?.role,
    pathname: location.pathname,
    isLoading,
    isRefreshing
  });

  // Show loading state while checking auth
  if (isLoading || isRefreshing) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="mr-4 text-gray-500">يرجى الانتظار...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('User not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check for admin-only routes
  const adminOnlyRoutes = ['/settings', '/users-management', '/admin/users-management']; 
  if (adminOnlyRoutes.some(route => location.pathname === route)) {
    // Allow access if user is admin OR has developer role
    const isAdmin = user?.isAdmin;
    const isDeveloper = user?.role === 'developer';
    
    if (!isAdmin && !isDeveloper) {
      console.log('User is not admin or developer, redirecting from:', location.pathname);
      toast.error("ليس لديك صلاحية الوصول إلى هذه الصفحة");
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
