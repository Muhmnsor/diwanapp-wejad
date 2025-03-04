
import { Link } from "react-router-dom";
import { Grid, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminNavLinksProps {
  isActive: (path: string) => boolean;
  isMobile: boolean;
}

export const AdminNavLinks = ({ isActive, isMobile }: AdminNavLinksProps) => {
  return (
    <>
      <Link
        to="/admin/dashboard"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          isActive("/admin/dashboard") ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {isMobile ? <Grid className="h-4 w-4" /> : "التطبيقات"}
      </Link>
      <Link
        to="/users-management"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          isActive("/users-management") ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {isMobile ? <Users className="h-4 w-4" /> : "إدارة المستخدمين"}
      </Link>
    </>
  );
};
