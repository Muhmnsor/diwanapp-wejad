import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { UserRoleData } from "@/components/users/types";

export const useUserRoles = () => {
  return useQuery({
    queryKey: ['user-roles'],
    queryFn: async () => {
      try {
        // First get the current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('Error getting current user:', userError);
          throw userError;
        }
        
        console.log('Current user:', user?.id);
        
        if (!user) {
          console.log('No authenticated user found');
          return [];
        }

        // Get user roles with a single query that joins the roles table
        console.log('Fetching roles for user:', user.id);
        const { data: userRolesData, error: rolesError } = await supabase
          .from('user_roles')
          .select(`
            user_id,
            roles (
              id,
              name,
              description
            )
          `)
          .eq('user_id', user.id);

        if (rolesError) {
          console.error('Error fetching user roles:', rolesError);
          throw rolesError;
        }

        console.log('Raw user roles data:', userRolesData);
        
        // Handle the case where no role is found
        if (!userRolesData || userRolesData.length === 0) {
          console.log('No roles found for user');
          return [];
        }

        // Map through the roles and extract names, ensuring proper type checking
        const roleNames = userRolesData.map(data => {
          if (!data.roles || typeof data.roles !== 'object') {
            console.log('No roles data found for entry:', data);
            return 'لم يتم تعيين دور';
          }
          // First cast to unknown, then to the expected type
          const role = data.roles as unknown as { name: string };
          return role.name || 'لم يتم تعيين دور';
        });
        
        console.log('Processed user roles:', roleNames);
        return roleNames;
      } catch (error) {
        console.error('Error in useUserRoles:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 2,
    refetchOnWindowFocus: false
  });
};