
import { Button } from "@/components/ui/button";
import { Grid, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useUserName } from "@/hooks/dashboard/useUserName";
import { cn } from "@/lib/utils";

export const AdminHeader = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { data: userName, isLoading: isUserNameLoading } = useUserName();

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
          
          <div className="flex items-center justify-center md:justify-end gap-4">
            {/* User Greeting */}
            <div className="hidden md:block text-right">
              <p className="text-sm text-muted-foreground">مرحباً بك،</p>
              <p className="font-medium">{isUserNameLoading ? "..." : userName}</p>
            </div>
            
            {/* Apps Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/admin/dashboard")}
              className="flex items-center gap-2 text-sm border-gray-200 transition-colors duration-200 hover:bg-gray-100"
            >
              <Grid className="h-4 w-4 text-primary" />
              <span className="hidden md:inline">التطبيقات</span>
            </Button>
            
            {/* Profile Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/update-profile")}
              className="flex items-center gap-2 text-sm border-gray-200 transition-colors duration-200 hover:bg-gray-100"
            >
              <User className="h-4 w-4 text-primary" />
              <span className="hidden md:inline">الملف الشخصي</span>
            </Button>
            
            {/* Notification Bell */}
            <NotificationBell />
            
            {/* Logout Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm border-gray-200 transition-colors duration-200 hover:bg-gray-100 hover:text-red-600 hover:border-red-200"
            >
              <LogOut className="h-4 w-4 text-primary" />
              <span className="hidden md:inline">تسجيل الخروج</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
