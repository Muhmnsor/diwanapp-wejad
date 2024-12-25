import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UserRoleData {
  roles: {
    name: string;
  };
}

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

      const { data: userRolesData, error: userRolesError } = await supabase
        .from('user_roles')
        .select('roles:role_id(name)')
        .eq('user_id', user.id);

      if (userRolesError) {
        console.error('Error fetching user roles:', userRolesError);
        throw userRolesError;
      }

      console.log('Raw user roles data:', userRolesData);
      const roles = userRolesData?.map(role => role.roles.name).filter(Boolean) || [];
      console.log('Processed user roles:', roles);
      return roles;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 2
  });
};