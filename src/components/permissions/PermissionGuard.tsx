
import React from 'react';
import { usePermissions } from './usePermissions';

interface PermissionGuardProps {
  app: string;
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * A component that conditionally renders content based on user permissions
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  app,
  permission,
  children,
  fallback = null
}) => {
  const { hasPermission, isLoading } = usePermissions();
  
  // While permissions are loading, don't show anything
  if (isLoading) {
    return null;
  }
  
  if (hasPermission(app, permission)) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
};

/**
 * A higher-order component that wraps a component with permission checking
 */
export function withPermission(
  WrappedComponent: React.ComponentType<any>,
  app: string,
  permission: string
) {
  return function WithPermissionComponent(props: any) {
    return (
      <PermissionGuard app={app} permission={permission}>
        <WrappedComponent {...props} />
      </PermissionGuard>
    );
  };
}
