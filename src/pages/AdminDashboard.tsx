
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Footer } from "@/components/layout/Footer";
import { DashboardApps } from "@/components/admin/dashboard/DashboardApps";
import { DashboardNotifications } from "@/components/admin/dashboard/DashboardNotifications";
import { DashboardHeader } from "@/components/admin/dashboard/DashboardHeader";
import { useNotificationCounts } from "@/hooks/dashboard/useNotificationCounts";
import { useUserName } from "@/hooks/dashboard/useUserName";
import { getAppsList } from "@/components/admin/dashboard/getAppsList";
import { DeveloperToolbar } from "@/components/developer/DeveloperToolbar";
import { useAuthStore } from "@/store/refactored-auth";
import { useEffect } from "react";
import { initializeDeveloperRole } from "@/utils/developer/roleManagement";

const AdminDashboard = () => {
  const { data: userName, isLoading: isLoadingUser } = useUserName();
  const { data: notificationCounts } = useNotificationCounts();
  const { user } = useAuthStore();
  
  const apps = getAppsList(notificationCounts);

  useEffect(() => {
    // Initialize developer role
    initializeDeveloperRole();
  }, []);

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <AdminHeader />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <DashboardHeader 
          userName={userName} 
          isLoading={isLoadingUser} 
        />
        
        <DashboardApps apps={apps} />

        <DashboardNotifications 
          notificationCount={notificationCounts.notifications} 
        />
      </div>

      <Footer />
      <DeveloperToolbar />
    </div>
  );
};

export default AdminDashboard;
