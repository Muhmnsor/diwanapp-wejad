import { Link } from "react-router-dom";
import { Settings, LayoutDashboard, Grid } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminNavLinksProps {
  isActive: (path: string) => boolean;
  isMobile: boolean;
}

export const AdminNavLinks = ({ isActive, isMobile }: AdminNavLinksProps) => {
  return (
    <>
      <Link
        to="/admin"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          isActive("/admin") ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {isMobile ? <Grid className="h-4 w-4" /> : "التطبيقات"}
      </Link>
      <Link
        to="/dashboard"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          isActive("/dashboard") ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {isMobile ? <LayoutDashboard className="h-4 w-4" /> : "لوحة المعلومات"}
      </Link>
      <Link
        to="/settings"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          isActive("/settings") ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {isMobile ? <Settings className="h-4 w-4" /> : "الإعدادات"}
      </Link>
    </>
  );
};