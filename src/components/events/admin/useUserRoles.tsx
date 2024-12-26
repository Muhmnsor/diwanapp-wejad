import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { UserRoleData } from "@/components/users/types";

export const useUserRoles = () => {
  return useQuery({
    queryKey: ['user-roles'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user:', user?.id);
      
      if (!user) {
        console.log('No authenticated user found');
        return [];
      }

      // Get user roles with a single query that joins the roles table
      const { data: userRolesData, error } = await supabase
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

      if (error) {
        console.error('Error fetching user roles:', error);
        throw error;
      }

      console.log('Raw user roles data:', userRolesData);
      
      // Handle the case where no role is found
      if (!userRolesData || userRolesData.length === 0) {
        console.log('No roles found for user');
        return [];
      }

      // Map through the roles and extract names
      const roleNames = (userRolesData as UserRoleData[]).map(data => {
        // Since roles is now an array, we take the first role if it exists
        return data.roles[0]?.name || 'لم يتم تعيين دور';
      });
      
      console.log('Processed user roles:', roleNames);
      return roleNames;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 2
  });
};