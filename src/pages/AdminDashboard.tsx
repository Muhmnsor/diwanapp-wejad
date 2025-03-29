
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
import { Loader2, Users, AlertCircle, CalendarClock } from "lucide-react";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Card } from "@/components/ui/card";
import { getCustomApps } from "@/components/admin/dashboard/customApps";

const AdminDashboard = () => {
  const { data: userName, isLoading: isLoadingUser } = useUserName();
  const { data: notificationCounts, isLoading: isLoadingNotifications, error: notificationsError } = useNotificationCounts();
  const { user } = useAuthStore();
  const { hasAdminRole, isLoading: isLoadingRoles } = useUserRoles();
  const [apps, setApps] = useState<AppItem[]>([]);
  const [isLoadingApps, setIsLoadingApps] = useState<boolean>(true);
  const [appsError, setAppsError] = useState<Error | null>(null);
  
  useEffect(() => {
    const fetchApps = async () => {
      if (!user) {
        console.log("User not available, skipping apps fetch");
        setIsLoadingApps(false);
        return;
      }

      if (!notificationCounts) {
        console.log("Notification counts not available yet, skipping apps fetch");
        return;
      }

      setIsLoadingApps(true);
      setAppsError(null);
      
      try {
        console.log("Fetching apps with user:", user.id, "and notification counts:", notificationCounts);
        // Get standard apps from existing function
        const standardAppsList = await getAppsList(notificationCounts, user);
        
        // Get our custom apps
        const customAppsList = getCustomApps(user, notificationCounts);
        
        // Combine the lists
        const allApps = [...standardAppsList, ...customAppsList];
        
        if (hasAdminRole) {
          const meetingsApp: AppItem = {
            title: "إدارة الاجتماعات",
            icon: CalendarClock,
            path: "/admin/meetings",
            description: "إدارة جدول الاجتماعات والمشاركين والمحاضر",
            notifications: notificationCounts?.meetings || 0,
          };
          
          const meetingsAppExists = allApps.some(app => app.path === "/admin/meetings");
          
          if (!meetingsAppExists) {
            allApps.push(meetingsApp);
          }
        }
        
        setApps(allApps);
      } catch (error) {
        console.error("Error fetching apps:", error);
        setAppsError(error instanceof Error ? error : new Error("Failed to fetch apps"));
      } finally {
        setIsLoadingApps(false);
      }
    };
    
    fetchApps();
  }, [user, notificationCounts, hasAdminRole]);

  const isLoading = isLoadingUser || isLoadingNotifications || isLoadingApps || isLoadingRoles;

  const hasError = notificationsError || appsError;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col" dir="rtl">
        <AdminHeader />
        <div className="container mx-auto px-4 py-8 flex-grow flex justify-center items-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg">جاري تحميل البيانات...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="min-h-screen flex flex-col" dir="rtl">
        <AdminHeader />
        <div className="container mx-auto px-4 py-8 flex-grow">
          <Card className="p-8 max-w-lg mx-auto text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">حدث خطأ</h2>
            <p className="text-gray-600 mb-4">حدث خطأ أثناء تحميل بيانات لوحة التحكم. يرجى تحديث الصفحة والمحاولة مرة أخرى.</p>
            <p className="text-sm text-red-500">
              {(notificationsError instanceof Error ? notificationsError.message : '') || 
               (appsError instanceof Error ? appsError.message : '')}
            </p>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <AdminHeader />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <DashboardHeader 
          userName={userName} 
          isLoading={false} 
        />
        
        <DashboardApps apps={apps} />

        <DashboardNotifications 
          notificationCount={notificationCounts?.notifications || 0} 
        />
      </div>

      <Footer />
      <DeveloperToolbar />
    </div>
  );
};

export default AdminDashboard;
