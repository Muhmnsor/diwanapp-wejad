
import { useDetailedPermissions } from "@/hooks/useDetailedPermissions";
import { ReactNode } from "react";

interface PermissionGateProps {
  permission: string;
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * A component that conditionally renders content based on user permissions
 * @param permission The permission required to view the content
 * @param fallback Optional content to display if user lacks permission
 * @param children Content to display if user has permission
 */
export const PermissionGate = ({ permission, fallback = null, children }: PermissionGateProps) => {
  const { hasPermission, isLoading } = useDetailedPermissions();
  
  if (isLoading) return null;
  
  if (hasPermission(permission)) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
};

/**
 * Similar component but for checking any of the specified permissions
 */
export const AnyPermissionGate = ({ 
  permissions, 
  fallback = null, 
  children 
}: {
  permissions: string[];
  fallback?: ReactNode;
  children: ReactNode;
}) => {
  const { hasAnyPermission, isLoading } = useDetailedPermissions();
  
  if (isLoading) return null;
  
  if (hasAnyPermission(permissions)) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
};

/**
 * Component for checking if user has all specified permissions
 */
export const AllPermissionsGate = ({ 
  permissions, 
  fallback = null, 
  children 
}: {
  permissions: string[];
  fallback?: ReactNode;
  children: ReactNode;
}) => {
  const { hasAllPermissions, isLoading } = useDetailedPermissions();
  
  if (isLoading) return null;
  
  if (hasAllPermissions(permissions)) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
};
