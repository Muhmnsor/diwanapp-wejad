
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
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

const AdminDashboard = () => {
  const { data: userName, isLoading: isLoadingUser, error: userError } = useUserName();
  const { data: notificationCounts, isLoading: isLoadingNotifications, error: notificationsError } = useNotificationCounts();
  const { user } = useAuthStore();
  const [isPageReady, setIsPageReady] = useState(false);
  
  useEffect(() => {
    // Add a small delay to ensure all data is loaded
    const timer = setTimeout(() => {
      setIsPageReady(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Use default notification counts if there's an error or data is loading
  const safeNotificationCounts = notificationCounts || {
    tasks: 0,
    notifications: 0,
    ideas: 0,
    finance: 0
  };
  
  const apps = getAppsList(safeNotificationCounts);
  
  // Render loading state
  if (!isPageReady || isLoadingUser) {
    return (
      <div className="min-h-screen flex flex-col" dir="rtl">
        <AdminHeader />
        <div className="container mx-auto px-4 py-8 flex-grow">
          <Card className="p-6 mb-6">
            <Skeleton className="h-12 w-3/4 mb-4" />
            <Skeleton className="h-6 w-1/2" />
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-12 w-12 mx-auto mb-4 rounded-full" />
                <Skeleton className="h-6 w-2/3 mx-auto mb-2" />
                <Skeleton className="h-4 w-full" />
              </Card>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  // Render error state
  const hasError = userError || notificationsError;
  if (hasError) {
    return (
      <div className="min-h-screen flex flex-col" dir="rtl">
        <AdminHeader />
        <div className="container mx-auto px-4 py-8 flex-grow">
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              حدث خطأ أثناء تحميل البيانات. الرجاء تحديث الصفحة أو المحاولة مرة أخرى لاحقاً.
            </AlertDescription>
          </Alert>
          
          <Card className="p-6 text-center">
            <h2 className="text-xl font-bold mb-2">عذراً، لم نتمكن من تحميل لوحة المعلومات</h2>
            <p className="text-muted-foreground">يرجى التحقق من اتصالك بالإنترنت وتحديث الصفحة.</p>
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
          isLoading={isLoadingUser} 
        />
        
        <DashboardApps apps={apps} />

        <DashboardNotifications 
          notificationCount={safeNotificationCounts.notifications} 
        />
      </div>

      <Footer />
      {user?.isAdmin && <DeveloperToolbar />}
    </div>
  );
};

export default AdminDashboard;
