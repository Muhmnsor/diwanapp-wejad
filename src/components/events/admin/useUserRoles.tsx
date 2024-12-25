import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UserRoleResponse {
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

      const roleNames = (userRolesData as UserRoleResponse[] | null)?.map(ur => ur.roles.name) || [];
      console.log('Processed user roles:', roleNames);
      return roleNames;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 2
  });
};