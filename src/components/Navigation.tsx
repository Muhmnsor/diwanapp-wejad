
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
    if (path === '/admin/dashboard') {
      return location.pathname === '/admin/dashboard';
    }
    if (path === '/meetings') {
      return location.pathname.startsWith('/meetings');
    }
    return location.pathname === path;
  };

  // Show admin links for all authenticated users
  const shouldShowAdminLinks = isAuthenticated;

  return (
    <nav className="flex gap-2 md:gap-4 items-center flex-wrap" dir="rtl">
      {shouldShowAdminLinks && <AdminNavLinks isActive={isActive} isMobile={isMobile} />}
    </nav>
  );
};
