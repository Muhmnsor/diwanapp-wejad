
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";

export const TopHeader = () => {
  const location = useLocation();
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

  // Set active tab based on URL hash or default to "overview"
  useEffect(() => {
    if (isTasksPage) {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'workspaces') {
        setActiveTab('workspaces');
      } else {
        setActiveTab('overview');
      }
    }
  }, [location.pathname, isTasksPage]);

  // Update URL hash when tab changes
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

          {/* Tasks Secondary Header with Tabs - Only show on tasks pages */}
          {isTasksPage && (
            <div className="w-full bg-gray-50 border-t">
              <Tabs 
                defaultValue="overview" 
                value={activeTab}
                onValueChange={handleTabChange}
                className="w-full"
              >
                <div className="flex justify-center">
                  <TabsList className="grid grid-cols-2 w-full max-w-md bg-gray-100 m-3">
                    <TabsTrigger 
                      value="overview"
                      className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      <LayoutDashboard className="h-4 w-4 ml-2" />
                      لوحة المعلومات
                    </TabsTrigger>
                    <TabsTrigger 
                      value="workspaces"
                      className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      <FolderKanban className="h-4 w-4 ml-2" />
                      مساحات العمل
                    </TabsTrigger>
                  </TabsList>
                </div>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
