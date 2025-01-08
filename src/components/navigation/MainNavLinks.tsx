import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface MainNavLinksProps {
  isActive: (path: string) => boolean;
  isMobile: boolean;
}

export const MainNavLinks = ({ isActive, isMobile }: MainNavLinksProps) => {
  return (
    <Link
      to="/"
      className={cn(
        "text-sm font-medium transition-colors hover:text-primary",
        isActive("/") ? "text-foreground" : "text-muted-foreground"
      )}
    >
      {isMobile ? <Home className="h-4 w-4" /> : "الأحداث"}
    </Link>
  );
};