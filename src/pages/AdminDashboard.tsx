
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Footer } from "@/components/layout/Footer";
import { DashboardContent } from "@/components/admin/dashboard/DashboardContent";
import { useUserName } from "@/hooks/dashboard/useUserName";
import { useAdminApps } from "@/components/admin/dashboard/useAdminApps";
import { useNotificationCounts } from "@/hooks/dashboard/useNotificationCounts";

const AdminDashboard = () => {
  const { data: userName, isLoading: isLoadingUser } = useUserName();
  const { data: notificationCounts } = useNotificationCounts();
  const apps = useAdminApps();

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <AdminHeader />
      
      <DashboardContent 
        userName={userName || "المستخدم"}
        isLoadingUser={isLoadingUser}
        apps={apps}
        notificationsCount={notificationCounts.notifications}
      />

      <Footer />
    </div>
  );
};

export default AdminDashboard;
