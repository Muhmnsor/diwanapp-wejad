
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface RoleInfo {
  id: string;
  name: string;
  description: string | null;
}

export interface UserRoleInfo {
  userId: string;
  userEmail: string | null;
  roles: RoleInfo[];
  permissions: string[];
  isAdmin: boolean;
  isDeveloper: boolean;
}

export const useRolePermissionDebug = () => {
  const [userRoleInfo, setUserRoleInfo] = useState<UserRoleInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRoleInfo = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Get current user
        const { data: sessionData } = await supabase.auth.getSession();
        const userId = sessionData.session?.user.id;
        const userEmail = sessionData.session?.user.email;

        if (!userId) {
          throw new Error("No authenticated user found");
        }

        // Get user roles
        const { data: userRolesData, error: userRolesError } = await supabase
          .from("user_roles")
          .select(`
            role_id,
            roles (
              id,
              name,
              description
            )
          `)
          .eq("user_id", userId);

        if (userRolesError) throw userRolesError;

        // Extract role information
        const roles: RoleInfo[] = userRolesData
          ?.map((ur) => ({
            id: ur.roles.id,
            name: ur.roles.name,
            description: ur.roles.description,
          }))
          .filter(Boolean) || [];

        // Check if user has admin or developer role
        const isAdmin = roles.some(
          (r) => r.name === "admin" || r.name === "app_admin" || r.name === "مدير" || r.name === "مدير_تطبيق"
        );
        const isDeveloper = roles.some(
          (r) => r.name === "developer" || r.name === "مطور"
        );

        // Get permissions
        const { data: permissionsData, error: permissionsError } = await supabase.rpc(
          "get_user_permissions",
          { p_user_id: userId }
        );

        if (permissionsError) throw permissionsError;

        // Format permissions
        const permissions = permissionsData?.map(
          (p) => `${p.app}.${p.permission}`
        ) || [];

        setUserRoleInfo({
          userId,
          userEmail,
          roles,
          permissions,
          isAdmin,
          isDeveloper,
        });
      } catch (err: any) {
        console.error("Error fetching user role info:", err);
        setError(err.message || "Failed to load role information");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRoleInfo();
  }, []);

  return {
    userRoleInfo,
    isLoading,
    error,
  };
};
