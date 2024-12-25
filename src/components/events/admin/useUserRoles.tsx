import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UserRoleResponse {
  roles: {
    name: string;
  };
}

interface SupabaseUserRoleResponse {
  roles: {
    name: string;
  }[];
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

      const roles = (userRolesData as SupabaseUserRoleResponse[]).map(role => role.roles[0]?.name).filter(Boolean);
      console.log('User roles fetched:', roles);
      return roles;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 2
  });
};