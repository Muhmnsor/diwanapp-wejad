
import React from 'react';
import { useAppPermissions, AppName } from '@/hooks/useAppPermissions';
import { Loader2 } from 'lucide-react';

interface AppPermissionGuardProps {
  appName: AppName;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loadingComponent?: React.ReactNode;
}

/**
 * A component that conditionally renders content based on user's app access permissions
 */
export const AppPermissionGuard: React.FC<AppPermissionGuardProps> = ({
  appName,
  children,
  fallback = null,
  loadingComponent = <LoadingIndicator />
}) => {
  const { isLoading, hasAppAccess } = useAppPermissions();
  const [hasAccess, setHasAccess] = React.useState<boolean | null>(null);
  
  React.useEffect(() => {
    const checkAccess = async () => {
      const access = await hasAppAccess(appName);
      setHasAccess(access);
    };
    
    if (!isLoading) {
      checkAccess();
    }
  }, [isLoading, appName, hasAppAccess]);
  
  // While permissions are loading, show loading indicator
  if (isLoading || hasAccess === null) {
    return <>{loadingComponent}</>;
  }
  
  if (hasAccess) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
};

// Loading indicator component
const LoadingIndicator = () => (
  <div className="flex justify-center items-center p-4">
    <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
    <span className="text-muted-foreground">جاري التحقق من الصلاحيات...</span>
  </div>
);

/**
 * A higher-order component that wraps a component with app permission checking
 */
export function withAppPermission(
  WrappedComponent: React.ComponentType<any>,
  appName: AppName
) {
  return function WithAppPermissionComponent(props: any) {
    return (
      <AppPermissionGuard appName={appName}>
        <WrappedComponent {...props} />
      </AppPermissionGuard>
    );
  };
}
