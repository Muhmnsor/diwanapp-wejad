
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
import { Loader2 } from "lucide-react";
import { getMeetingsAppCard, useMeetingsNotificationCount } from "@/components/meetings/utils/meetingsAppExtension";

const AdminDashboard = () => {
  const { data: userName, isLoading: isLoadingUser } = useUserName();
  const { data: notificationCounts } = useNotificationCounts();
  const { user } = useAuthStore();
  const [apps, setApps] = useState<AppItem[]>([]);
  const [isLoadingApps, setIsLoadingApps] = useState<boolean>(true);
  const meetingsCount = useMeetingsNotificationCount();
  
  // Fetch apps list when user or notification counts change
  useEffect(() => {
    const fetchApps = async () => {
      if (user) {
        setIsLoadingApps(true);
        try {
          // Get standard apps
          const appsList = await getAppsList(notificationCounts, user);
          
          // Add meetings app if user is admin or has appropriate role
          if (user.isAdmin || user.role === 'admin' || user.role === 'app_admin' || user.role === 'developer') {
            const meetingsApp = getMeetingsAppCard();
            // Update with real notification count
            meetingsApp.notifications = meetingsCount;
            
            // Add to apps list if not already present
            if (!appsList.some(app => app.path === '/meetings')) {
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
  }, [user, notificationCounts, meetingsCount]);

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
