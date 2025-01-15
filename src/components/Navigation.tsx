import { useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useIsMobile } from "@/hooks/use-mobile";
import { AdminNavLinks } from "./navigation/AdminNavLinks";

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
      {user?.isAdmin && <AdminNavLinks isActive={isActive} isMobile={isMobile} />}
    </nav>
  );
};