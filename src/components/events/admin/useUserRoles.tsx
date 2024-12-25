import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface RoleData {
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

      // Get user roles with a single query
      const { data: userRolesData, error } = await supabase
        .from('user_roles')
        .select(`
          roles (
            name
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching user roles:', error);
        throw error;
      }

      console.log('Raw user roles data:', userRolesData);
      
      // Cast to unknown first, then to the correct type
      const typedData = (userRolesData as unknown) as RoleData[];
      const roleNames = typedData?.map(ur => ur.roles.name) || [];
      console.log('Processed user roles:', roleNames);
      return roleNames;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 2
  });
};