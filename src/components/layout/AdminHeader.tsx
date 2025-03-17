
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { AdminNavLinks } from "@/components/navigation/AdminNavLinks";
import { useUserName } from "@/hooks/dashboard/useUserName";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/layout/header/Logo";
import { useIsMobile } from "@/hooks/use-mobile";

export const AdminHeader = () => {
  const navigate = useNavigate();
  const { logout, isAuthenticated } = useAuthStore();
  const { data: userName } = useUserName();
  const isMobile = useIsMobile();

  const handleLogout = async () => {
    try {
      console.log("AdminHeader: Starting logout process");
      await logout();
      console.log("AdminHeader: Logout successful, redirecting to login");
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("AdminHeader: Error during logout:", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center">
          <Logo />
        </div>
        
        <div className="flex items-center space-x-4">
          <AdminNavLinks isActive={(path) => location.pathname === path} isMobile={isMobile} />
          
          <div className="hidden md:flex h-8 w-px bg-muted/50 mx-2"></div>
          
          <div className="flex items-center gap-4">
            {isAuthenticated && <NotificationBell />}
            
            {userName && !isMobile && (
              <span className="text-sm font-medium text-muted-foreground">
                {userName}
              </span>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className={cn(
                "flex items-center gap-2 text-sm border-gray-200 transition-colors duration-200",
                "hover:bg-gray-100 hover:text-red-600 hover:border-red-200"
              )}
            >
              <span className={cn(isMobile ? "sr-only" : "")}>تسجيل الخروج</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
