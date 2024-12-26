import { useQuery } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { useAuthStore } from "@/store/authStore";
import { supabase } from "@/integrations/supabase/client";
import { CreateUserDialog } from "@/components/users/CreateUserDialog";
import { UsersTable } from "@/components/users/UsersTable";
import type { Role, User, UserRoleResponse } from "@/components/users/types";

const Users = () => {
  const { user } = useAuthStore();

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
      
      return data as Role[];
    }
  });

  const { data: users = [], isLoading: usersLoading, refetch: refetchUsers } = useQuery({
    queryKey: ['users-with-roles'],
    queryFn: async () => {
      console.log('Fetching users with roles...');
      
      // First get user details from the Edge Function
      const { data: usersResponse, error: usersError } = await supabase.functions.invoke('manage-users', {
        body: { operation: 'get_users' }
      });

      if (usersError) {
        console.error('Error fetching users:', usersError);
        throw usersError;
      }

      // Then get user roles
      const { data: userRolesData, error: userRolesError } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          roles (
            name,
            description
          )
        `);

      if (userRolesError) {
        console.error('Error fetching user roles:', userRolesError);
        throw userRolesError;
      }

      // Create a map of user roles - take the first role if user has multiple
      const userRolesMap = (userRolesData as UserRoleResponse[]).reduce((acc, curr) => {
        // If user has multiple roles, take the first one
        const firstRole = curr.roles[0]?.name || 'No role';
        acc[curr.user_id] = firstRole;
        return acc;
      }, {} as Record<string, string>);

      // Combine user details with roles
      const transformedUsers = usersResponse.users.map(authUser => ({
        id: authUser.id,
        username: authUser.email,
        role: userRolesMap[authUser.id] || 'No role',
        lastLogin: authUser.last_sign_in_at ? new Date(authUser.last_sign_in_at).toLocaleString('ar-SA') : 'لم يسجل دخول بعد'
      }));

      console.log('Transformed users:', transformedUsers);
      return transformedUsers as User[];
    }
  });

  if (!user?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (usersLoading || rolesLoading) {
    return <div className="text-center p-8">جاري التحميل...</div>;
  }

  return (
    <div dir="rtl">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">إدارة المستخدمين</h1>
          <CreateUserDialog roles={roles} onUserCreated={refetchUsers} />
        </div>
        <UsersTable users={users} />
      </div>
    </div>
  );
};

export default Users;