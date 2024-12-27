import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Plus, Settings, Home, LayoutDashboard } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export const Navigation = () => {
  const location = useLocation();
  const { user } = useAuthStore();
  const isMobile = useIsMobile();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="flex gap-2 md:gap-4 items-center flex-wrap" dir="rtl">
      <Link
        to="/"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          isActive("/")
            ? "text-foreground"
            : "text-muted-foreground"
        )}
      >
        {isMobile ? (
          <Home className="h-4 w-4" />
        ) : (
          "الرئيسية"
        )}
      </Link>
      {user?.isAdmin && (
        <>
          <Link
            to="/dashboard"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              isActive("/dashboard")
                ? "text-foreground"
                : "text-muted-foreground"
            )}
          >
            {isMobile ? (
              <LayoutDashboard className="h-4 w-4" />
            ) : (
              "لوحة المعلومات"
            )}
          </Link>
          <Link
            to="/settings"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              isActive("/settings")
                ? "text-foreground"
                : "text-muted-foreground"
            )}
          >
            {isMobile ? (
              <Settings className="h-4 w-4" />
            ) : (
              "الإعدادات"
            )}
          </Link>
          <Link to="/create-event">
            <Button 
              variant="outline" 
              size={isMobile ? "icon" : "sm"} 
              className={cn(
                "gap-2",
                isMobile ? "w-8 h-8 p-0" : ""
              )}
            >
              <Plus className="h-4 w-4" />
              {!isMobile && "إنشاء فعالية"}
            </Button>
          </Link>
        </>
      )}
    </nav>
  );
};