
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/refactored-auth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [sessionChecked, setSessionChecked] = useState(false);
  
  useEffect(() => {
    console.log("ProtectedRoute: Setting up auth state listener");
    let isSubscribed = true;
    
    const checkSession = async () => {
      if (!isSubscribed) return;
      
      try {
        console.log("Checking session validity...");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session check error:', error);
          if (isSubscribed) {
            if (error.message.includes('session_not_found') || 
                error.message.includes('refresh_token_not_found') ||
                error.message.includes('Invalid refresh token')) {
              console.log('Invalid or expired session, logging out');
              toast.error('انتهت صلاحية جلستك. الرجاء تسجيل الدخول مرة أخرى');
              await logout();
            }
            setIsLoading(false);
            setSessionChecked(true);
          }
          return;
        }

        if (!session) {
          console.log('No active session found');
          if (isAuthenticated) {
            console.log('State shows authenticated but no session exists, logging out');
            await logout();
          }
          if (isSubscribed) {
            setIsLoading(false);
            setSessionChecked(true);
          }
          return;
        }
        
        console.log("Valid session found:", session.user.id);
        if (isSubscribed) {
          setIsLoading(false);
          setSessionChecked(true);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        if (isSubscribed) {
          await logout();
          setIsLoading(false);
          setSessionChecked(true);
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
        if (isSubscribed) {
          await logout();
          setIsLoading(false);
          setSessionChecked(true);
        }
      }
      
      if (event === 'SIGNED_IN') {
        console.log('User signed in');
        // The auth store will handle this, just update loading state
        if (isSubscribed) {
          setIsLoading(false);
          setSessionChecked(true);
        }
      }
    });

    // Check session on mount
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
    sessionChecked,
    userIsAdmin: user?.isAdmin,
    userRole: user?.role,
    pathname: location.pathname,
    isLoading
  });

  // Show loading state while checking auth
  if (isLoading || !sessionChecked) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">جاري التحقق من صلاحية الجلسة...</p>
        </div>
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
