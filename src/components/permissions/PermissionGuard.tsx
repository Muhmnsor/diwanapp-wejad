
import { ReactNode } from "react";
import { usePermissionCheck } from "@/utils/permissions/permissionChecker";

interface PermissionGuardProps {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export const PermissionGuard = ({ 
  permission,
  children,
  fallback
}: PermissionGuardProps) => {
  const { data: hasPermission, isLoading } = usePermissionCheck(permission);

  if (isLoading) {
    return null;
  }

  if (!hasPermission) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
};
