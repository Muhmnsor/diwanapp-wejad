import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Plus, Settings, Home, LayoutDashboard } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useIsMobile } from "@/hooks/use-mobile";

export const Navigation = () => {
  const location = useLocation();
  const { user, isAuthenticated } = useAuthStore();
  const isMobile = useIsMobile();

  console.log('Navigation - User:', user);
  console.log('Navigation - Current location:', location.pathname);

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
      {isAuthenticated && (
        <div className="flex gap-2">
          <Link to="/events/create">
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
          <Link to="/create-project">
            <Button 
              variant="outline" 
              size={isMobile ? "icon" : "sm"} 
              className={cn(
                "gap-2",
                isMobile ? "w-8 h-8 p-0" : ""
              )}
            >
              <Plus className="h-4 w-4" />
              {!isMobile && "إنشاء مشروع"}
            </Button>
          </Link>
        </div>
      )}
    </nav>
  );
};