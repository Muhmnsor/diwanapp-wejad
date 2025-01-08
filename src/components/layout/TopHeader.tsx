import { Navigation } from "@/components/Navigation";
import { UserNav } from "@/components/navigation/UserNav";
import { Button } from "@/components/ui/button";
import { Settings, Plus, LayoutDashboard, Calendar } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

export const TopHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();
  
  // Check if we're on an events-related page - updated to include projects and settings pages
  const isEventsPage = location.pathname.includes('/events') || 
                      location.pathname === '/' || 
                      location.pathname.includes('/dashboard') ||
                      location.pathname.includes('/create-project') ||
                      location.pathname.includes('/projects') ||
                      location.pathname === '/settings';

  return (
    <div className="w-full bg-white border-b">
      <div className="container mx-auto px-4">
        <div className="flex flex-col" dir="rtl">
          {/* Logo and Main Navigation */}
          <div className="flex justify-between items-center py-4">
            <div className="w-full flex justify-center md:justify-start md:w-auto">
              <img 
                src="/lovable-uploads/cc0ac885-dec0-4720-b30c-27371944cda6.png" 
                alt="ديوان" 
                className="h-24 object-contain cursor-pointer"
                onClick={() => navigate("/")}
              />
            </div>
            <div className="flex items-center gap-2">
              <Navigation />
              <UserNav />
            </div>
          </div>

          {/* Events Action Bar - Only shown on events pages and for authenticated users */}
          {isAuthenticated && isEventsPage && (
            <div className="flex justify-center items-center gap-4 py-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => navigate("/dashboard")}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>لوحة المعلومات</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => navigate("/settings")}
              >
                <Settings className="h-4 w-4" />
                <span>الإعدادات</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => navigate("/")}
              >
                <Calendar className="h-4 w-4" />
                <span>الأحداث</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => navigate("/events/create")}
              >
                <Plus className="h-4 w-4" />
                <span>إنشاء فعالية</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => navigate("/create-project")}
              >
                <Plus className="h-4 w-4" />
                <span>إنشاء مشروع</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};