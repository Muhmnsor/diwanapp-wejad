import { useLocation } from "react-router-dom";
import { AdminNavLinks } from "../navigation/AdminNavLinks";
import { MainNavLinks } from "../navigation/MainNavLinks";
import { UserNav } from "../navigation/UserNav";
import { CreateButtons } from "../navigation/CreateButtons";
import { useAuthStore } from "@/store/authStore";
import { useIsMobile } from "@/hooks/use-mobile";

export const TopHeader = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();
  const isMobile = useIsMobile();
  
  // Check if we're on an events-related page - updated to include all management paths
  const isEventsPage = location.pathname.includes('/events') || 
                      location.pathname === '/' || 
                      location.pathname.includes('/dashboard') ||
                      location.pathname.includes('/create-project') ||
                      location.pathname.includes('/settings');

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="w-full bg-white py-4 border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <MainNavLinks isActive={isActive} isMobile={isMobile} />
          <div className="flex items-center gap-4">
            {isAuthenticated && <CreateButtons isMobile={isMobile} />}
            <UserNav />
          </div>
        </div>
      </div>
      {isAuthenticated && isEventsPage && (
        <div className="container mx-auto px-4 mt-4">
          <AdminNavLinks isActive={isActive} isMobile={isMobile} />
        </div>
      )}
    </div>
  );
};