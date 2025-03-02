
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
      
      // Get all users from profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email');

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      // Then get user roles with their role information
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

      // Map user roles to user IDs
      const userRolesMap = userRolesData.reduce((map, ur) => {
        map[ur.user_id] = ur.roles;
        return map;
      }, {});

      // Combine the data - include all users, even those without roles
      const transformedUsers = profilesData.map((profile) => {
        const userRole = userRolesMap[profile.id];
        return {
          id: profile.id,
          username: profile.email || 'لم يتم تعيين بريد إلكتروني',
          role: userRole?.name || 'لم يتم تعيين دور',
          lastLogin: 'غير متوفر' // Since we can't access auth.users directly
        };
      });

      console.log('All users (including those without roles):', transformedUsers);
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
