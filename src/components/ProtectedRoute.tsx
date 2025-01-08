import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed in ProtectedRoute:', { event, userId: session?.user?.id });
      
      if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed successfully');
      }

      if (event === 'SIGNED_OUT') {
        console.log('User signed out, redirecting to login');
        logout();
      }
    });

    // Check session validity
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session check error:', error);
          if (error.message.includes('refresh_token_not_found')) {
            toast.error('Your session has expired. Please login again.');
            logout();
          }
        }

        if (!session) {
          console.log('No active session found');
          logout();
        }
      } catch (error) {
        console.error('Error checking session:', error);
        logout();
      }
    };

    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [logout]);

  console.log('Protected route check:', { isAuthenticated, user, pathname: location.pathname });

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
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