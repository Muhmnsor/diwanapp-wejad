import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useUserRoles = () => {
  return useQuery({
    queryKey: ['user-roles'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Fetching roles for user:', user?.id);
      
      if (!user) {
        console.log('No authenticated user found');
        return [];
      }

      const { data: userRolesData, error: userRolesError } = await supabase
        .from('user_roles')
        .select(`
          roles (
            name
          )
        `)
        .eq('user_id', user.id);

      if (userRolesError) {
        console.error('Error fetching user roles:', userRolesError);
        throw userRolesError;
      }

      const roles = userRolesData?.map(role => role.roles.name) || [];
      console.log('User roles:', roles);
      return roles;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 2
  });
};