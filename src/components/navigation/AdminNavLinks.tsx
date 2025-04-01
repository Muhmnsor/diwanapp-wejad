import { Link } from "react-router-dom";
import { Grid, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AdminNavLinksProps {
  isActive: (path: string) => boolean;
  isMobile: boolean;
}

export const AdminNavLinks = ({ isActive, isMobile }: AdminNavLinksProps) => {
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        asChild
        className="flex items-center gap-2 text-sm border-gray-200 transition-colors duration-200 hover:bg-gray-100 hover:text-primary hover:border-primary/20"
      >
        <Link
          to="/admin/dashboard"
          className={cn(
            "flex items-center gap-2",
            isActive("/admin/dashboard") ? "text-primary" : "text-muted-foreground"
          )}
        >
          <Grid className="h-4 w-4" />
          {!isMobile && <span>التطبيقات</span>}
        </Link>
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        asChild
        className="flex items-center gap-2 text-sm border-gray-200 transition-colors duration-200 hover:bg-gray-100 hover:text-primary hover:border-primary/20"
      >
        <Link
          to="/admin/hr"
          className={cn(
            "flex items-center gap-2",
            isActive("/admin/hr") ? "text-primary" : "text-muted-foreground"
          )}
        >
          <Users className="h-4 w-4" />
          {!isMobile && <span>الموارد البشرية</span>}
        </Link>
      </Button>
    </>
  );
};
