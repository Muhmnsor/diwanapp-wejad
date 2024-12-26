import { useQuery } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { useAuthStore } from "@/store/authStore";
import { supabase } from "@/integrations/supabase/client";
import { CreateUserDialog } from "@/components/users/CreateUserDialog";
import { UsersTable } from "@/components/users/UsersTable";
import type { Role, User } from "@/components/users/types";

const Users = () => {
  const { user } = useAuthStore();

  const { data: roles = [], isLoading: rolesLoading, error: rolesError } = useQuery({
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
      
      // First, get all user roles
      const { data: userRoles, error: userRolesError } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          role_id,
          roles (
            name,
            description
          )
        `);

      if (userRolesError) {
        console.error('Error fetching user roles:', userRolesError);
        throw userRolesError;
      }

      // Then, get user details from auth.users
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error('Error fetching auth users:', authError);
        throw authError;
      }

      // Map and combine the data
      return userRoles.map(ur => {
        const authUser = authUsers.users.find(au => au.id === ur.user_id);
        return {
          id: ur.user_id,
          username: authUser?.email || 'Unknown',
          role: ur.roles?.name || 'No role',
          lastLogin: authUser?.last_sign_in_at 
            ? new Date(authUser.last_sign_in_at).toLocaleString('ar-SA') 
            : '-'
        };
      }) as User[];
    }
  });

  if (!user?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (rolesError) {
    return (
      <div className="text-center p-8 text-red-500">
        خطأ في تحميل الأدوار: {rolesError.message}
      </div>
    );
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