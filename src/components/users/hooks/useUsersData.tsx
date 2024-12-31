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
      
      // First get user roles with their role information
      const { data: userRolesData, error: userRolesError } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          roles (
            id,
            name,
            description
          )
        `);

      if (userRolesError) {
        console.error('Error fetching user roles:', userRolesError);
        throw userRolesError;
      }

      // Then get user information from profiles table
      const userIds = userRolesData.map(ur => ur.user_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      // Combine the data
      const transformedUsers = userRolesData.map((roleData: any) => {
        const userProfile = profilesData.find(p => p.id === roleData.user_id);
        return {
          id: roleData.user_id,
          username: userProfile?.email || 'لم يتم تعيين بريد إلكتروني',
          role: roleData.roles?.name || 'لم يتم تعيين دور',
          lastLogin: 'غير متوفر' // Since we can't access auth.users directly
        };
      });

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