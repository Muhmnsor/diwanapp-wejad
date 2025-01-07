import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isAuthenticated) {
      // Refetch queries when route changes for authenticated users
      queryClient.invalidateQueries();
    }
  }, [isAuthenticated, location.pathname, queryClient]);

  console.log('Protected route check:', { 
    isAuthenticated, 
    user, 
    pathname: location.pathname,
    queryCache: queryClient.getQueryCache().getAll()
  });

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check for admin-only routes
  const adminOnlyRoutes = ['/settings'];
  if (adminOnlyRoutes.includes(location.pathname) && !user?.isAdmin) {
    console.log('User is not admin, redirecting from:', location.pathname);
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;