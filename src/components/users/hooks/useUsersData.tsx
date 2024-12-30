import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { User, UserRoleData } from "../types";

export const useUsersData = () => {
  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roles')
        .select('*');
      
      if (error) {
        console.error('Error fetching roles:', error);
        throw error;
      }
      
      return data;
    }
  });

  const { data: users = [], isLoading: usersLoading, refetch: refetchUsers } = useQuery({
    queryKey: ['users-with-roles'],
    queryFn: async () => {
      console.log('Fetching users with roles...');
      
      const { data: userRolesData, error: userRolesError } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          roles (
            id,
            name,
            description
          ),
          profiles!user_id (
            id,
            email
          )
        `);

      if (userRolesError) {
        console.error('Error fetching user roles:', userRolesError);
        throw userRolesError;
      }

      console.log('User roles data:', userRolesData);

      const transformedUsers = userRolesData.map((data: any) => ({
        id: data.user_id,
        username: data.profiles?.email,
        role: data.roles?.name || 'لم يتم تعيين دور',
        lastLogin: 'لم يسجل دخول بعد'
      }));

      console.log('Transformed users with roles:', transformedUsers);
      return transformedUsers as User[];
    },
    staleTime: 1000 * 30, // Cache for 30 seconds
  });

  return {
    roles,
    users,
    isLoading: rolesLoading || usersLoading,
    refetchUsers
  };
};