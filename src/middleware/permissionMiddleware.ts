
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDetailedPermissions } from "@/hooks/useDetailedPermissions";
import { toast } from "sonner";

interface PermissionGuardProps {
  requiredPermission: string;
  fallbackPath?: string;
  children: React.ReactNode;
}

/**
 * A component that guards routes based on permissions
 */
export const PermissionGuard = ({
  requiredPermission,
  fallbackPath = "/",
  children
}: PermissionGuardProps) => {
  const navigate = useNavigate();
  const { hasPermission, isLoading } = useDetailedPermissions();
  
  useEffect(() => {
    if (!isLoading && !hasPermission(requiredPermission)) {
      toast.error("ليس لديك صلاحية للوصول إلى هذه الصفحة");
      navigate(fallbackPath, { replace: true });
    }
  }, [hasPermission, isLoading, navigate, requiredPermission, fallbackPath]);
  
  if (isLoading) {
    return <div className="p-8 text-center">جاري التحقق من الصلاحيات...</div>;
  }
  
  if (hasPermission(requiredPermission)) {
    return <>{children}</>;
  }
  
  return null;
};

/**
 * Similar component that can check for multiple permissions (any of them)
 */
export const AnyPermissionGuard = ({
  requiredPermissions,
  fallbackPath = "/",
  children
}: {
  requiredPermissions: string[];
  fallbackPath?: string;
  children: React.ReactNode;
}) => {
  const navigate = useNavigate();
  const { hasAnyPermission, isLoading } = useDetailedPermissions();
  
  useEffect(() => {
    if (!isLoading && !hasAnyPermission(requiredPermissions)) {
      toast.error("ليس لديك صلاحية للوصول إلى هذه الصفحة");
      navigate(fallbackPath, { replace: true });
    }
  }, [hasAnyPermission, isLoading, navigate, requiredPermissions, fallbackPath]);
  
  if (isLoading) {
    return <div className="p-8 text-center">جاري التحقق من الصلاحيات...</div>;
  }
  
  if (hasAnyPermission(requiredPermissions)) {
    return <>{children}</>;
  }
  
  return null;
};
