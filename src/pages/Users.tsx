
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { UsersTable } from "@/components/users/UsersTable";
import { UsersHeader } from "@/components/users/UsersHeader";
import { useUsersData } from "@/components/users/hooks/useUsersData";
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { Loader2 } from "lucide-react";

const Users = () => {
  const { user } = useAuthStore();
  const { roles, users, isLoading, error, refetchUsers } = useUsersData();

  if (!user?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col" dir="rtl">
        <TopHeader />
        <div className="container mx-auto px-4 py-8 flex-grow flex justify-center items-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <h2 className="text-xl font-medium">جاري تحميل بيانات المستخدمين...</h2>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <TopHeader />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <UsersHeader roles={roles} users={users} onUserCreated={refetchUsers} />
        <UsersTable 
          users={users} 
          onUserDeleted={refetchUsers}
          error={error}
        />
      </div>
      <Footer />
    </div>
  );
};

export default Users;
