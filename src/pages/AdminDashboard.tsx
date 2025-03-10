
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Footer } from "@/components/layout/Footer";
import { DashboardApps } from "@/components/admin/dashboard/DashboardApps";
import { DashboardNotifications } from "@/components/admin/dashboard/DashboardNotifications";
import { DashboardHeader } from "@/components/admin/dashboard/DashboardHeader";
import { useNotificationCounts } from "@/hooks/dashboard/useNotificationCounts";
import { useUserName } from "@/hooks/dashboard/useUserName";
import { useDashboardApps } from "@/hooks/useDashboardApps";
import { DeveloperToolbar } from "@/components/developer/DeveloperToolbar";
import { useAuthStore } from "@/store/refactored-auth";

const AdminDashboard = () => {
  const { data: userName, isLoading: isLoadingUser } = useUserName();
  const { data: notificationCounts } = useNotificationCounts();
  const { user } = useAuthStore();
  
  // Use the permission-based hook instead of direct list
  const { apps, isLoading: isLoadingApps } = useDashboardApps(notificationCounts);

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <AdminHeader />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <DashboardHeader 
          userName={userName} 
          isLoading={isLoadingUser} 
        />
        
        {isLoadingApps ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[...Array(9)].map((_, index) => (
              <div 
                key={index} 
                className="h-64 bg-muted rounded-lg"
              ></div>
            ))}
          </div>
        ) : (
          <DashboardApps apps={apps} />
        )}

        <DashboardNotifications 
          notificationCount={notificationCounts.notifications} 
        />
      </div>

      <Footer />
      {/* Show developer toolbar for both admin and developer users */}
      {(user?.isAdmin || user?.role === 'developer') && <DeveloperToolbar />}
    </div>
  );
};

export default AdminDashboard;
