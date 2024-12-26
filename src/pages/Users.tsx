import { useQuery } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { useAuthStore } from "@/store/authStore";
import { supabase } from "@/integrations/supabase/client";
import { CreateUserDialog } from "@/components/users/CreateUserDialog";
import { UsersTable } from "@/components/users/UsersTable";
import type { Role, User } from "@/components/users/types";

// Define the type for the user roles response
interface UserRoleResponse {
  user_id: string;
  roles: {
    name: string;
    description: string;
  };
}

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

      // Transform the data into the expected format
      const transformedUsers = (userRolesData as UserRoleResponse[]).map(userRole => ({
        id: userRole.user_id,
        username: userRole.user_id, // We'll only show the user ID for now since we can't access emails
        role: userRole.roles.name || 'No role',
        lastLogin: '-' // We can't access last login time without admin privileges
      }));

      console.log('Transformed users:', transformedUsers);
      return transformedUsers as User[];
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