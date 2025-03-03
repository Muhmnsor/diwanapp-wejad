
import { Navigation } from "@/components/Navigation";
import { UserNav } from "@/components/navigation/UserNav";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Logo } from "./header/Logo";
import { HomeButton } from "./header/HomeButton";
import { AdminActions } from "./header/AdminActions";
import { Button } from "@/components/ui/button";
import { FolderKanban, LayoutDashboard } from "lucide-react";
import { Link } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";

export const TopHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState("overview");
  
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

  // تحديث التبويب النشط بناءً على عنوان URL
  useEffect(() => {
    if (location.pathname === "/tasks") {
      const hash = location.hash.replace('#', '');
      if (hash === 'workspaces' || hash === 'overview') {
        setActiveTab(hash);
      } else if (!hash) {
        // إذا لم يكن هناك هاش، نضع القيمة الافتراضية
        setActiveTab("overview");
        window.location.hash = "overview";
      }
    }
  }, [location]);

  // معالج تغيير التبويب
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    window.location.hash = value;
  };

  return (
    <div className="w-full bg-white border-b">
      <div className="w-full px-2 sm:container sm:mx-auto sm:px-4">
        <div className="flex flex-col" dir="rtl">
          {/* Logo and Main Navigation */}
          <div className="flex flex-col xs:flex-row md:flex-row md:justify-between md:items-center py-2 md:py-4 gap-2 xs:gap-4">
            <Logo />
            <div className="flex items-center justify-center gap-2 mt-1 xs:mt-0 md:mt-0 flex-wrap xs:flex-nowrap">
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
            <div className="flex items-center justify-center py-2 md:py-3 border-t w-full">
              <div className="flex items-center gap-2 md:gap-4 w-full justify-center">
                <Link to="/tasks" className="flex-1 md:flex-none">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full md:w-auto flex items-center justify-center gap-2"
                  >
                    <FolderKanban className="h-4 w-4" />
                    المحافظ
                  </Button>
                </Link>
                <Link to="/tasks/dashboard" className="flex-1 md:flex-none">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full md:w-auto flex items-center justify-center gap-2"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    لوحة المعلومات
                  </Button>
                </Link>
                
                {/* نضيف هنا عنصر التبويب للتنقل بين النظرة العامة ومساحات العمل */}
                {location.pathname === "/tasks" && (
                  <Tabs 
                    value={activeTab}
                    onValueChange={handleTabChange}
                    className="flex-1 md:flex-none ml-2 w-full"
                  >
                    <TabsList className="grid grid-cols-2 bg-secondary/20 p-1 rounded-xl">
                      <TabsTrigger 
                        value="overview" 
                        className="data-[state=active]:bg-white"
                      >
                        نظرة عامة
                      </TabsTrigger>
                      <TabsTrigger 
                        value="workspaces" 
                        className="data-[state=active]:bg-white"
                      >
                        مساحات العمل
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
