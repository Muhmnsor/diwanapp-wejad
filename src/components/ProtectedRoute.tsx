
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/refactored-auth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    console.log("ProtectedRoute: Setting up auth state listener");
    let isSubscribed = true;
    
    const checkSession = async () => {
      if (!isSubscribed) return;
      setIsLoading(true);

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session check error:', error);
          if (error.message.includes('session_not_found') || 
              error.message.includes('refresh_token_not_found') ||
              error.message.includes('Invalid refresh token')) {
            console.log('Invalid or expired session, logging out');
            toast.error('انتهت صلاحية جلستك. الرجاء تسجيل الدخول مرة أخرى');
            await logout();
          }
        } else if (!session) {
          console.log('No active session found');
          if (isAuthenticated) {
            console.log('State shows authenticated but no session exists, logging out');
            await logout();
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
        if (isSubscribed) {
          await logout();
        }
      } finally {
        if (isSubscribed) {
          setIsLoading(false);
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed in ProtectedRoute:', { event, userId: session?.user?.id });
      
      if (!isSubscribed) return;

      if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed successfully');
      }

      if (event === 'SIGNED_OUT') {
        console.log('User signed out, redirecting to login');
        await logout();
      }
      
      if (event === 'SIGNED_IN') {
        console.log('User signed in');
        // Don't need to do anything, the auth store will handle this
      }
      
      checkSession();
    });

    checkSession();

    return () => {
      console.log("ProtectedRoute: Cleaning up auth state listener");
      isSubscribed = false;
      subscription.unsubscribe();
    };
  }, [logout, isAuthenticated]);

  console.log('Protected route check:', { 
    isAuthenticated, 
    user, 
    pathname: location.pathname,
    isLoading
  });

  // Show loading state while checking auth
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }

  if (!isAuthenticated) {
    console.log('User not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check for admin-only routes
  const adminOnlyRoutes = ['/settings', '/users-management', '/admin/users-management']; 
  if (adminOnlyRoutes.some(route => location.pathname === route) && !user?.isAdmin) {
    console.log('User is not admin, redirecting from:', location.pathname);
    toast.error("ليس لديك صلاحية الوصول إلى هذه الصفحة");
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
