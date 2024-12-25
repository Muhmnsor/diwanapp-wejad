import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

      // First get the user's role IDs
      const { data: userRoles, error: userRolesError } = await supabase
        .from('user_roles')
        .select('role_id')
        .eq('user_id', user.id);

      if (userRolesError) {
        console.error('Error fetching user role IDs:', userRolesError);
        throw userRolesError;
      }

      if (!userRoles?.length) {
        console.log('No roles found for user');
        return [];
      }

      // Then get the role names using the role IDs
      const roleIds = userRoles.map(ur => ur.role_id);
      const { data: roles, error: rolesError } = await supabase
        .from('roles')
        .select('name')
        .in('id', roleIds);

      if (rolesError) {
        console.error('Error fetching role names:', rolesError);
        throw rolesError;
      }

      console.log('Processed user roles:', roles?.map(r => r.name) || []);
      return roles?.map(r => r.name) || [];
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 2
  });
};