import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

export const Navigation = () => {
  const location = useLocation();
  const { user } = useAuthStore();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="flex gap-4 items-center" dir="rtl">
      <Link
        to="/"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          isActive("/")
            ? "text-foreground"
            : "text-muted-foreground"
        )}
      >
        الرئيسية
      </Link>
      {user?.isAdmin && (
        <>
          <Link
            to="/settings"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              isActive("/settings")
                ? "text-foreground"
                : "text-muted-foreground"
            )}
          >
            الإعدادات
          </Link>
          <Link
            to="/users"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              isActive("/users")
                ? "text-foreground"
                : "text-muted-foreground"
            )}
          >
            إدارة المستخدمين
          </Link>
        </>
      )}
    </nav>
  );
};