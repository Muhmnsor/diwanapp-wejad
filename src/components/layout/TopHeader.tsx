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
                      location.pathname.includes('/dashboard') ||
                      location.pathname.includes('/create-project') ||
                      location.pathname.includes('/projects') ||
                      location.pathname === '/settings';

  const isEventOrProjectDetails = location.pathname.includes('/events/') || 
                                 location.pathname.includes('/projects/');

  const isTasksPage = location.pathname.includes('/tasks') ||
                     location.pathname.includes('/portfolios');

  return (
    <div className="w-full bg-white border-b">
      <div className="container mx-auto px-4">
        <div className="flex flex-col" dir="rtl">
          {/* Logo and Main Navigation */}
          <div className="flex justify-between items-center py-4">
            <Logo />
            <div className="flex items-center gap-2">
              <HomeButton 
                isEventOrProjectDetails={isEventOrProjectDetails}
                isAuthenticated={isAuthenticated}
              />
              <Navigation />
              <UserNav />
            </div>
          </div>

          {/* Admin Actions Bar */}
          <AdminActions 
            isAuthenticated={isAuthenticated}
            isEventsPage={isEventsPage}
          />

          {/* Tasks Secondary Header - Only show on tasks pages */}
          {isTasksPage && (
            <div className="flex items-center justify-between py-3 border-t">
              <div className="flex items-center gap-4">
                <Link to="/tasks">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <FolderKanban className="h-4 w-4" />
                    المحافظ
                  </Button>
                </Link>
                <Link to="/tasks/dashboard">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <LayoutDashboard className="h-4 w-4" />
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