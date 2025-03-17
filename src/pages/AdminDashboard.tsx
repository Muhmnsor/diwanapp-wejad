
import { useState, useEffect } from "react";
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
import { AppItem } from "@/components/admin/dashboard/DashboardApps";
import { Loader2, Users } from "lucide-react";
import { useUserRoles } from "@/hooks/useUserRoles";

const AdminDashboard = () => {
  const { data: userName, isLoading: isLoadingUser } = useUserName();
  const { data: notificationCounts } = useNotificationCounts();
  const { user } = useAuthStore();
  const { hasAdminRole } = useUserRoles();
  const [apps, setApps] = useState<AppItem[]>([]);
  const [isLoadingApps, setIsLoadingApps] = useState<boolean>(true);
  
  // Fetch apps list when user or notification counts change
  useEffect(() => {
    const fetchApps = async () => {
      if (user) {
        setIsLoadingApps(true);
        try {
          // Fetch the original apps list from the getAppsList function
          const appsList = await getAppsList(notificationCounts, user);
          
          // Add the meetings app to the list if user has admin access
          if (hasAdminRole) {
            const meetingsApp: AppItem = {
              title: "إدارة الاجتماعات",
              icon: Users,
              path: "/admin/meetings",
              description: "إدارة جدول الاجتماعات والمشاركين والمحاضر",
              notifications: notificationCounts?.meetings || 0,
            };
            
            // Check if meetings app already exists to avoid duplicates
            const meetingsAppExists = appsList.some(app => app.path === "/admin/meetings");
            
            if (!meetingsAppExists) {
              // Add the meetings app to the list
              appsList.push(meetingsApp);
            }
          }
          
          setApps(appsList);
        } catch (error) {
          console.error("Error fetching apps:", error);
        } finally {
          setIsLoadingApps(false);
        }
      }
    };
    
    fetchApps();
  }, [user, notificationCounts, hasAdminRole]);

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <AdminHeader />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <DashboardHeader 
          userName={userName} 
          isLoading={isLoadingUser} 
        />
        
        {isLoadingApps ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="mr-2">جاري تحميل التطبيقات...</span>
          </div>
        ) : (
          <DashboardApps apps={apps} />
        )}

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
