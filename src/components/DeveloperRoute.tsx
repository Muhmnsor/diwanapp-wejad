
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/refactored-auth";
import { useEffect, useState } from "react";
import { isDeveloper } from "@/utils/developer/roleManagement";
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
        const hasDeveloper = await isDeveloper(user.id);
        setHasDeveloperAccess(hasDeveloper);
        
        console.log('Developer access check:', { 
          userId: user.id, 
          email: user.email,
          role: user.role,
          hasDeveloperAccess: hasDeveloper 
        });
      } catch (error) {
        console.error('Error checking developer access:', error);
        setHasDeveloperAccess(false);
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
