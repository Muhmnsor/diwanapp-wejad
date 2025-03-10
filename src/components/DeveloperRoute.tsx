
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/refactored-auth";
import { useEffect, useState } from "react";
import { isDeveloper } from "@/utils/developerRole";
import { toast } from "sonner";

interface DeveloperRouteProps {
  children: React.ReactNode;
}

const DeveloperRoute = ({ children }: DeveloperRouteProps) => {
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [hasDeveloperAccess, setHasDeveloperAccess] = useState(false);
  
  useEffect(() => {
    const checkDeveloperAccess = async () => {
      setIsLoading(true);

      if (!isAuthenticated || !user) {
        setHasDeveloperAccess(false);
        setIsLoading(false);
        return;
      }

      try {
        // Always grant access to admin users, but also check developer role for logging
        const hasDeveloper = await isDeveloper(user.id);
        
        // Important fix: Always grant access to admin users
        // This ensures admin users like info@dfy.org.sa can always access developer features
        const hasAccess = hasDeveloper || user.isAdmin;
        setHasDeveloperAccess(hasAccess);
        
        // Log the result for debugging
        console.log('Developer access check:', { 
          userId: user.id, 
          email: user.email,
          isAdmin: user.isAdmin,
          hasDeveloperRole: hasDeveloper,
          hasDeveloperAccess: hasAccess
        });
      } catch (error) {
        console.error('Error checking developer access:', error);
        // For admins, grant access even if the developer role check fails
        setHasDeveloperAccess(user.isAdmin || false);
      } finally {
        setIsLoading(false);
      }
    };

    checkDeveloperAccess();
  }, [isAuthenticated, user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!hasDeveloperAccess) {
    toast.error("ليس لديك صلاحية الوصول إلى إعدادات المطور");
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
};

export default DeveloperRoute;
