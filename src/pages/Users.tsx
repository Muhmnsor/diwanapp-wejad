import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { UsersTable } from "@/components/users/UsersTable";
import { UsersHeader } from "@/components/users/UsersHeader";
import { useUsersData } from "@/components/users/hooks/useUsersData";

const Users = () => {
  const { user } = useAuthStore();
  const { roles, users, isLoading, refetchUsers } = useUsersData();

  if (!user?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (isLoading) {
    return <div className="text-center p-8">جاري التحميل...</div>;
  }

  return (
    <div dir="rtl">
      <div className="container mx-auto px-4 py-8">
        <UsersHeader roles={roles} onUserCreated={refetchUsers} />
        <UsersTable users={users} onUserDeleted={refetchUsers} />
      </div>
    </div>
  );
};

export default Users;