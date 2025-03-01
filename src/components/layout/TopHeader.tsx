
import { Navigation } from "@/components/Navigation";
import { UserNav } from "@/components/navigation/UserNav";
import { useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Logo } from "./header/Logo";
import { HomeButton } from "./header/HomeButton";
import { AdminActions } from "./header/AdminActions";
import { Button } from "@/components/ui/button";
import { FolderKanban, LayoutDashboard } from "lucide-react";
import { Link } from "react-router-dom";

export const TopHeader = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();
  
  const isEventsPage = location.pathname.includes('/events') || 
                      location.pathname === '/' || 
                      location.pathname === '/dashboard' ||
                      location.pathname.includes('/create-project') ||
                      location.pathname.includes('/projects') ||
                      location.pathname === '/settings';

  const isEventOrProjectDetails = location.pathname.includes('/events/') || 
                                 location.pathname.includes('/projects/');

  const isTasksPage = location.pathname.includes('/tasks') ||
                     location.pathname.includes('/portfolios') ||
                     location.pathname.includes('/portfolio-workspaces');

  return (
    <div className="w-full bg-white border-b">
      <div className="w-full px-2 sm:container sm:mx-auto sm:px-4">
        <div className="flex flex-col" dir="rtl">
          {/* Logo and Main Navigation */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 sm:py-3 md:py-4">
            <Logo />
            <div className="flex items-center justify-center flex-wrap gap-1 sm:gap-2 mt-1 sm:mt-0">
              <HomeButton 
                isEventOrProjectDetails={isEventOrProjectDetails}
                isAuthenticated={isAuthenticated}
              />
              <Navigation />
              <UserNav />
            </div>
          </div>

          {/* Admin Actions Bar - Only show on events pages and NOT on tasks pages */}
          {isEventsPage && !isTasksPage && (
            <div className="w-full">
              <AdminActions 
                isAuthenticated={isAuthenticated}
                isEventsPage={isEventsPage}
              />
            </div>
          )}

          {/* Tasks Secondary Header - Only show on tasks pages */}
          {isTasksPage && (
            <div className="flex items-center justify-center py-1 sm:py-2 md:py-3 border-t w-full">
              <div className="flex items-center gap-1 sm:gap-2 md:gap-4 w-full justify-center">
                <Link to="/tasks" className="flex-1 md:flex-none">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full md:w-auto flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm"
                  >
                    <FolderKanban className="h-3 w-3 sm:h-4 sm:w-4" />
                    المحافظ
                  </Button>
                </Link>
                <Link to="/tasks/dashboard" className="flex-1 md:flex-none">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full md:w-auto flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm"
                  >
                    <LayoutDashboard className="h-3 w-3 sm:h-4 sm:w-4" />
                    لوحة المعلومات
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
