import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();

  console.log('Protected route check:', { isAuthenticated, user, pathname: location.pathname });

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