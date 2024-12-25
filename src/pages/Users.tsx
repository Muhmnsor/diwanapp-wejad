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

  // Fetch roles from the database with improved error handling and logging
  const { data: roles = [], isLoading: rolesLoading, error: rolesError } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      console.log('Fetching roles... Current user:', user);
      
      // Log the current authentication state
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Current Supabase session:', session);

      const { data, error } = await supabase
        .from('roles')
        .select('*');
      
      if (error) {
        console.error('Detailed Supabase roles fetch error:', error);
        throw error;
      }
      
      console.log('Fetched roles (detailed):', data);
      return data as Role[];
    }
  });

  // Fetch users with their roles
  const { data: users = [], isLoading: usersLoading, refetch: refetchUsers } = useQuery({
    queryKey: ['users-with-roles'],
    queryFn: async () => {
      console.log('Fetching users with roles...');
      const { data: userRoles, error } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          roles (
            name,
            description
          )
        `);

      if (error) {
        console.error('Error fetching user roles:', error);
        throw error;
      }

      console.log('Fetched user roles:', userRoles);
      return userRoles.map(ur => ({
        id: ur.user_id,
        role: ur.roles?.name || 'No role',
        username: ur.user_id,
        lastLogin: '-'
      })) as User[];
    }
  });

  // التحقق من صلاحيات المستخدم
  if (!user?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (rolesError) {
    console.error('Roles error details:', rolesError);
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