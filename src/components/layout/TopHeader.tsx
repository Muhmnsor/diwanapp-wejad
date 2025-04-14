import { Navigation } from "@/components/Navigation";
import { UserNav } from "@/components/navigation/UserNav";
import { useLocation, useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Logo } from "./header/Logo";
import { HomeButton } from "./header/HomeButton";
import { AdminActions } from "./header/AdminActions";
import { Button } from "@/components/ui/button";
import { Calendar, FolderKanban, LayoutDashboard, FileText, User, ClipboardList, Repeat, Inbox, BarChart4 } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const TopHeader = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("overview");
  const [displayName, setDisplayName] = useState<string | null>(null);

  const isEventsPage = location.pathname === '/' || 
                      location.pathname === '/dashboard' || 
                      location.pathname.includes('/events') || 
                      location.pathname.includes('/create-project') || 
                      location.pathname.includes('/projects');

  const isEventOrProjectDetails = location.pathname.includes('/events/') || location.pathname.includes('/projects/');
  const isTasksPage = location.pathname.includes('/tasks') || location.pathname.includes('/portfolios') || location.pathname.includes('/portfolio-workspaces') || location.pathname.includes('/general-tasks');
  const isRequestsPage = location.pathname.includes('/requests');

  useEffect(() => {
    const fetchUserDisplayName = async () => {
      if (isAuthenticated && user) {
        try {
          const {
            data,
            error
          } = await supabase.from('profiles').select('display_name').eq('id', user.id).single();
          if (!error && data) {
            setDisplayName(data.display_name);
          }
        } catch (error) {
          console.error("Error fetching user display name:", error);
        }
      }
    };
    fetchUserDisplayName();
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (isTasksPage) {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'workspaces') {
        setActiveTab('workspaces');
      } else if (hash === 'yearly-plan') {
        setActiveTab('yearly-plan');
      } else if (hash === 'reports') {
        setActiveTab('reports');
      } else if (hash === 'recurring') {
        setActiveTab('recurring');
      } else {
        setActiveTab('overview');
      }
    } else if (isRequestsPage) {
      const tabParam = searchParams.get('tab');
      if (tabParam) {
        setActiveTab(tabParam);
      } else {
        setActiveTab('incoming');
      }
    }
  }, [location.pathname, location.hash, isTasksPage, isRequestsPage, searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    window.location.hash = value;
  };

  return <div className="w-full bg-white border-b">
      <div className="w-full px-2 sm:container sm:mx-auto sm:px-4">
        <div className="flex flex-col" dir="rtl">
          <div className="flex flex-col xs:flex-row md:flex-row md:justify-between md:items-center py-2 md:py-4 gap-2 xs:gap-4">
            <Logo />
            <div className="flex items-center justify-center gap-2 mt-1 xs:mt-0 md:mt-0 flex-wrap xs:flex-nowrap">
              {isAuthenticated && user && <div className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md shadow-sm ms-2 py-2 px-3">
                  <User className="h-4 w-4 text-primary" />
                  <span className="whitespace-nowrap text-xs">{displayName || user.email || 'مستخدم'}</span>
                </div>}
              <HomeButton isEventOrProjectDetails={isEventOrProjectDetails} isAuthenticated={isAuthenticated} />
              <Navigation />
              <UserNav />
            </div>
          </div>

          {isEventsPage && !isTasksPage && !isRequestsPage && <div className="w-full">
              <AdminActions isAuthenticated={isAuthenticated} isEventsPage={isEventsPage} />
            </div>}

          {isTasksPage && <div className="w-full bg-white border-t py-3">
              <div className="flex justify-center overflow-x-auto">
                <div className="flex gap-6 items-center min-w-max">
                  <Link to="/tasks#overview" className={`flex items-center gap-2 cursor-pointer transition-colors duration-200 rounded-md px-3 py-1.5 hover:bg-gray-100 ${activeTab === "overview" ? "bg-primary/10 text-primary font-medium" : "text-gray-600 hover:text-gray-900"}`} onClick={() => handleTabChange("overview")}>
                    <LayoutDashboard className="h-4 w-4" />
                    <span className="hidden md:inline">لوحة المعلومات</span>
                  </Link>
                  
                  <Link to="/tasks#workspaces" className={`flex items-center gap-2 cursor-pointer transition-colors duration-200 rounded-md px-3 py-1.5 hover:bg-gray-100 ${activeTab === "workspaces" ? "bg-primary/10 text-primary font-medium" : "text-gray-600 hover:text-gray-900"}`} onClick={() => handleTabChange("workspaces")}>
                    <FolderKanban className="h-4 w-4" />
                    <span className="hidden md:inline">مساحات العمل</span>
                  </Link>

                  <Link to="/general-tasks" className={`flex items-center gap-2 cursor-pointer transition-colors duration-200 rounded-md px-3 py-1.5 hover:bg-gray-100 ${location.pathname === "/general-tasks" ? "bg-primary/10 text-primary font-medium" : "text-gray-600 hover:text-gray-900"}`}>
                    <ClipboardList className="h-4 w-4" />
                    <span className="hidden md:inline">المهام العامة</span>
                  </Link>

                  <Link to="/tasks#yearly-plan" className={`flex items-center gap-2 cursor-pointer transition-colors duration-200 rounded-md px-3 py-1.5 hover:bg-gray-100 ${activeTab === "yearly-plan" ? "bg-primary/10 text-primary font-medium" : "text-gray-600 hover:text-gray-900"}`} onClick={() => handleTabChange("yearly-plan")}>
                    <Calendar className="h-4 w-4" />
                    <span className="hidden md:inline">الخطة السنوية</span>
                  </Link>
                  
                  <Link to="/tasks#recurring" className={`flex items-center gap-2 cursor-pointer transition-colors duration-200 rounded-md px-3 py-1.5 hover:bg-gray-100 ${activeTab === "recurring" ? "bg-primary/10 text-primary font-medium" : "text-gray-600 hover:text-gray-900"}`} onClick={() => handleTabChange("recurring")}>
                    <Repeat className="h-4 w-4" />
                    <span className="hidden md:inline">المهام المتكررة</span>
                  </Link>
                  
                  <Link to="/tasks#reports" className={`flex items-center gap-2 cursor-pointer transition-colors duration-200 rounded-md px-3 py-1.5 hover:bg-gray-100 ${activeTab === "reports" ? "bg-primary/10 text-primary font-medium" : "text-gray-600 hover:text-gray-900"}`} onClick={() => handleTabChange("reports")}>
                    <FileText className="h-4 w-4" />
                    <span className="hidden md:inline">التقارير</span>
                  </Link>
                </div>
              </div>
            </div>}

          {isRequestsPage && <div className="w-full bg-white border-t py-3">
              <div className="flex justify-center">
                <div className="flex gap-6 items-center">
                  <Link to="/requests" className={`flex items-center gap-2 cursor-pointer transition-colors duration-200 rounded-md px-3 py-1.5 hover:bg-gray-100 ${activeTab === "incoming" ? "bg-primary/10 text-primary font-medium" : "text-gray-600 hover:text-gray-900"}`}>
                    <Inbox className="h-4 w-4" />
                    <span>الطلبات الواردة</span>
                  </Link>
                  
                  <Link to="/requests?tab=outgoing" className={`flex items-center gap-2 cursor-pointer transition-colors duration-200 rounded-md px-3 py-1.5 hover:bg-gray-100 ${activeTab === "outgoing" ? "bg-primary/10 text-primary font-medium" : "text-gray-600 hover:text-gray-900"}`}>
                    <FileText className="h-4 w-4" />
                    <span>الطلبات الصادرة</span>
                  </Link>

                  {(user?.isAdmin || user?.role === 'developer' || user?.role === 'admin') && (
                    <>
                      <Link to="/requests?tab=approvals" className={`flex items-center gap-2 cursor-pointer transition-colors duration-200 rounded-md px-3 py-1.5 hover:bg-gray-100 ${activeTab === "approvals" ? "bg-primary/10 text-primary font-medium" : "text-gray-600 hover:text-gray-900"}`}>
                        <ClipboardList className="h-4 w-4" />
                        <span>الاعتمادات</span>
                      </Link>
                      
                      <Link to="/requests?tab=admin-view" className={`flex items-center gap-2 cursor-pointer transition-colors duration-200 rounded-md px-3 py-1.5 hover:bg-gray-100 ${activeTab === "admin-view" ? "bg-primary/10 text-primary font-medium" : "text-gray-600 hover:text-gray-900"}`}>
                        <BarChart4 className="h-4 w-4" />
                        <span>لوحة الإدارة</span>
                      </Link>
                    </>
                  )}

                  <Link to="/requests?tab=forms" className={`flex items-center gap-2 cursor-pointer transition-colors duration-200 rounded-md px-3 py-1.5 hover:bg-gray-100 ${activeTab === "forms" ? "bg-primary/10 text-primary font-medium" : "text-gray-600 hover:text-gray-900"}`}>
                    <FolderKanban className="h-4 w-4" />
                    <span>النماذج والاستمارات</span>
                  </Link>
                </div>
              </div>
            </div>}
        </div>
      </div>
    </div>;
};
