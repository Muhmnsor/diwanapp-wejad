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
      
      const { data: usersResponse, error: usersError } = await supabase.functions.invoke('manage-users', {
        body: { operation: 'get_users' }
      });

      if (usersError) {
        console.error('Error fetching users:', usersError);
        throw usersError;
      }

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

      console.log('User roles data:', userRolesData);

      const userRolesMap = (userRolesData as UserRoleData[]).reduce((acc, curr) => {
        // تأكد من أن roles موجود وأن له خاصية name
        if (curr.roles && 'name' in curr.roles) {
          acc[curr.user_id] = curr.roles.name;
        }
        return acc;
      }, {} as Record<string, string>);

      console.log('User roles map:', userRolesMap);

      const transformedUsers = usersResponse.users.map(authUser => ({
        id: authUser.id,
        username: authUser.email,
        role: userRolesMap[authUser.id] || 'لم يتم تعيين دور',
        lastLogin: authUser.last_sign_in_at ? new Date(authUser.last_sign_in_at).toLocaleString('ar-SA') : 'لم يسجل دخول بعد'
      }));

      console.log('Transformed users with roles:', transformedUsers);
      return transformedUsers as User[];
    }
  });

  return {
    roles,
    users,
    isLoading: rolesLoading || usersLoading,
    refetchUsers
  };
};