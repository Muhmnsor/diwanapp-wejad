
import { useEffect, useState } from "react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Footer } from "@/components/layout/Footer";
import { DashboardApps, AppItem } from "@/components/admin/dashboard/DashboardApps";
import { DashboardNotifications } from "@/components/admin/dashboard/DashboardNotifications";
import { DashboardHeader } from "@/components/admin/dashboard/DashboardHeader";
import { useNotificationCounts } from "@/hooks/dashboard/useNotificationCounts";
import { useUserName } from "@/hooks/dashboard/useUserName";
import { getAppsList } from "@/components/admin/dashboard/getAppsList";
import { DeveloperToolbar } from "@/components/developer/DeveloperToolbar";
import { useAuthStore } from "@/store/refactored-auth";
import { initializeDeveloperRole } from "@/utils/developer/roleManagement";
import { filterAppsByPermission } from "@/utils/permissions/appPermissions";

const AdminDashboard = () => {
  const { data: userName, isLoading: isLoadingUser } = useUserName();
  const { data: notificationCounts } = useNotificationCounts();
  const { user } = useAuthStore();
  
  const [filteredApps, setFilteredApps] = useState<AppItem[]>([]);
  const [isLoadingApps, setIsLoadingApps] = useState(true);
  
  useEffect(() => {
    // Initialize developer role
    initializeDeveloperRole();
  }, []);

  useEffect(() => {
    const loadApps = async () => {
      setIsLoadingApps(true);
      try {
        // Get all apps
        const allApps = getAppsList(notificationCounts);
        
        // If user exists, filter apps based on permissions
        if (user?.id) {
          const permittedApps = await filterAppsByPermission(user.id, allApps);
          setFilteredApps(permittedApps);
        } else {
          setFilteredApps([]);
        }
      } catch (error) {
        console.error("Error loading apps:", error);
      } finally {
        setIsLoadingApps(false);
      }
    };
    
    loadApps();
  }, [user?.id, notificationCounts]);

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <AdminHeader />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <DashboardHeader 
          userName={userName} 
          isLoading={isLoadingUser} 
        />
        
        <DashboardApps apps={filteredApps} isLoading={isLoadingApps} />

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
