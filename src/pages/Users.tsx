import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { UsersTable } from "@/components/users/UsersTable";
import { UsersHeader } from "@/components/users/UsersHeader";
import { useUsersData } from "@/components/users/hooks/useUsersData";
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";

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
    <div className="min-h-screen flex flex-col" dir="rtl">
      <TopHeader />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <UsersHeader roles={roles} onUserCreated={refetchUsers} />
        <UsersTable users={users} onUserDeleted={refetchUsers} />
      </div>
      <Footer />
    </div>
  );
};

export default Users;