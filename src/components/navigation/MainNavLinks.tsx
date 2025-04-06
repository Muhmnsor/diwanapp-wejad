import { Link } from "react-router-dom";
import { Home, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface MainNavLinksProps {
  isActive: (path: string) => boolean;
  isMobile: boolean;
}

export const MainNavLinks = ({ isActive, isMobile }: MainNavLinksProps) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        asChild
      >
        <Link
          to="/"
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary flex items-center gap-2",
            isActive("/") ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {isMobile ? <Home className="h-4 w-4" /> : (
            <>
              <Calendar className="h-4 w-4" />
              <span>جميع الأحداث</span>
            </>
          )}
        </Link>
      </Button>
    </div>
  );
};