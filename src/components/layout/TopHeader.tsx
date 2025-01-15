import { Navigation } from "@/components/Navigation";
import { UserNav } from "@/components/navigation/UserNav";
import { useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Logo } from "./header/Logo";
import { HomeButton } from "./header/HomeButton";
import { AdminActions } from "./header/AdminActions";

export const TopHeader = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();
  
  // Check if we're on an events-related page
  const isEventsPage = location.pathname.includes('/events') || 
                      location.pathname === '/' || 
                      location.pathname.includes('/dashboard') ||
                      location.pathname.includes('/create-project') ||
                      location.pathname.includes('/projects') ||
                      location.pathname === '/settings';

  const isEventOrProjectDetails = location.pathname.includes('/events/') || 
                                 location.pathname.includes('/projects/');

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
        </div>
      </div>
    </div>
  );
};