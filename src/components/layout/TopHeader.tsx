import { useLocation } from "react-router-dom";
import { AdminNavLinks } from "../navigation/AdminNavLinks";
import { MainNavLinks } from "../navigation/MainNavLinks";
import { UserNav } from "../navigation/UserNav";
import { CreateButtons } from "../navigation/CreateButtons";
import { useAuthStore } from "@/store/authStore";

export const TopHeader = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();
  
  // Check if we're on an events-related page - updated to include all management paths
  const isEventsPage = location.pathname.includes('/events') || 
                      location.pathname === '/' || 
                      location.pathname.includes('/dashboard') ||
                      location.pathname.includes('/create-project') ||
                      location.pathname.includes('/settings');

  return (
    <div className="w-full bg-white py-4 border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <MainNavLinks />
          <div className="flex items-center gap-4">
            {isAuthenticated && <CreateButtons />}
            <UserNav />
          </div>
        </div>
      </div>
      {isAuthenticated && isEventsPage && (
        <div className="container mx-auto px-4 mt-4">
          <AdminNavLinks />
        </div>
      )}
    </div>
  );
};