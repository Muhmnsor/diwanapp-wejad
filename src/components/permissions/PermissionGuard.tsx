
import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/store/refactored-auth";
import { checkUserPermission, checkUserAnyPermission, checkUserAllPermissions } from "@/utils/developer/permissionChecker";

interface PermissionGuardProps {
  /** Component to render if the user has the required permissions */
  children: React.ReactNode;
  /** Permission name to check for */
  permission?: string;
  /** Multiple permissions to check (any of them) */
  anyPermissions?: string[];
  /** Multiple permissions to check (all of them) */
  allPermissions?: string[];
  /** Component to render if the user does not have the required permissions */
  fallback?: React.ReactNode;
  /** Module and action to check */
  moduleAction?: {
    module: string;
    action: string;
  };
}

/**
 * يقوم بفحص الصلاحيات المطلوبة ويعرض المحتوى المناسب بناءً على ذلك
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permission,
  anyPermissions,
  allPermissions,
  fallback = null,
  moduleAction,
}) => {
  const { user } = useAuthStore();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    const checkPermission = async () => {
      if (!user) {
        setHasPermission(false);
        return;
      }

      // Admin users have all permissions
      if (user.isAdmin) {
        setHasPermission(true);
        return;
      }

      let result = false;

      if (permission) {
        result = await checkUserPermission(user.id, permission);
      } else if (anyPermissions && anyPermissions.length > 0) {
        result = await checkUserAnyPermission(user.id, anyPermissions);
      } else if (allPermissions && allPermissions.length > 0) {
        result = await checkUserAllPermissions(user.id, allPermissions);
      } else if (moduleAction) {
        const { module, action } = moduleAction;
        const permName = `${module}_${action}`;
        result = await checkUserPermission(user.id, permName);
      } else {
        // If no permission checks are provided, show content by default
        result = true;
      }

      setHasPermission(result);
    };

    checkPermission();
  }, [user, permission, anyPermissions, allPermissions, moduleAction]);

  // Show nothing while loading
  if (hasPermission === null) {
    return null;
  }

  return hasPermission ? <>{children}</> : <>{fallback}</>;
};
