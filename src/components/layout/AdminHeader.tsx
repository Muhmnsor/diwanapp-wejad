
import { Button } from "@/components/ui/button";
import { LogOut, Grid } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { useUserName } from "@/hooks/dashboard/useUserName";
import { Navigation } from "@/components/Navigation";

export const AdminHeader = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { data: userName } = useUserName();

  const handleLogout = async () => {
    try {
      console.log("AdminHeader: Starting logout process");
      await logout();
      console.log("AdminHeader: Logout successful, redirecting to login");
      toast.success("تم تسجيل الخروج بنجاح");
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("AdminHeader: Error during logout:", error);
      toast.error("حدث خطأ أثناء تسجيل الخروج");
    }
  };

  return (
    <div className="w-full bg-white py-4 border-b">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4" dir="rtl">
          <div className="w-full flex justify-center md:justify-start md:w-auto">
            <img 
              src="/lovable-uploads/6e693a05-5355-4718-95b9-23327287d678.png" 
              alt="ديوان" 
              className="h-8 sm:h-10 md:h-12 lg:h-16 object-contain cursor-pointer max-w-[120px] sm:max-w-full"
              onClick={() => navigate("/admin")}
            />
          </div>
          
          <div className="flex items-center justify-center gap-4">
            <Navigation />
            <NotificationBell />
          </div>
          
          <div className="flex items-center justify-center gap-4 md:justify-end">
            <div className="text-sm font-medium">
              مرحباً، {userName || 'المستخدم'}
            </div>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span>تسجيل الخروج</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
