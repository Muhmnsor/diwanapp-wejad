
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/refactored-auth";
import { isDeveloper } from "@/utils/developer/roleManagement";

interface DeveloperRouteProps {
  children: React.ReactNode;
}

const DeveloperRoute: React.FC<DeveloperRouteProps> = ({ children }) => {
  const { user } = useAuthStore();
  const [hasDeveloperRole, setHasDeveloperRole] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkDeveloperRole = async () => {
      if (!user) {
        setHasDeveloperRole(false);
        setIsLoading(false);
        return;
      }

      try {
        const hasDeveloperAccess = await isDeveloper(user.id);
        setHasDeveloperRole(hasDeveloperAccess);
      } catch (error) {
        console.error("Error checking developer role:", error);
        setHasDeveloperRole(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkDeveloperRole();
  }, [user]);

  if (isLoading) {
    return <div className="text-center p-8">جاري التحميل...</div>;
  }

  if (!user || !hasDeveloperRole) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
};

export default DeveloperRoute;
