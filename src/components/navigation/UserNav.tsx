
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { NotificationBell } from '@/components/notifications/NotificationBell';

export const UserNav = () => {
  const navigate = useNavigate();
  const { logout, isAuthenticated, isLoading } = useAuthStore();

  const handleLogout = async () => {
    try {
      console.log("UserNav: Starting logout process");
      await logout();
      console.log("UserNav: Logout successful, redirecting to login");
      toast.success("تم تسجيل الخروج بنجاح");
      // Use replace to prevent going back to protected routes
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("UserNav: Error during logout:", error);
      toast.error("حدث خطأ أثناء تسجيل الخروج");
      // Still clear local state and redirect even if server logout fails
      navigate("/login", { replace: true });
    }
  };

  if (isLoading || !isAuthenticated) return null;

  return (
    <div className="flex items-center gap-4">
      <NotificationBell />
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
  );
};
