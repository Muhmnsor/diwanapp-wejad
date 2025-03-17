
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/refactored-auth";

export function useUserRoles() {
  const { user } = useAuthStore();
  const [hasAdminRole, setHasAdminRole] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUserRoles = async () => {
      if (!user) {
        setHasAdminRole(false);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Query for user roles that indicate admin access
        const { data, error } = await supabase
          .from("user_roles")
          .select(`
            role_id,
            roles:role_id (
              name
            )
          `)
          .eq("user_id", user.id);

        if (error) {
          throw error;
        }

        // Check if any of the user's roles are admin-type roles
        const isAdmin = data.some(
          (userRole) => 
            userRole.roles?.name === "admin" || 
            userRole.roles?.name === "app_admin" || 
            userRole.roles?.name === "developer" ||
            userRole.roles?.name === "meeting_manager"
        );

        setHasAdminRole(isAdmin);
      } catch (err) {
        console.error("Error fetching user roles:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRoles();
  }, [user]);

  return { hasAdminRole, isLoading, error };
}
