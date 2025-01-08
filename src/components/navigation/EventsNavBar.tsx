import { Link } from "react-router-dom";
import { Info, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMobile } from "@/hooks/use-mobile";

export const EventsNavBar = () => {
  const isMobile = useMobile();

  return (
    <div className="w-full bg-secondary/20 py-2 border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-end gap-4" dir="rtl">
          <Link
            to="/dashboard"
            className={cn(
              "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
              "text-muted-foreground"
            )}
          >
            <Info className="h-4 w-4" />
            {!isMobile && "لوحة معلومات الفعاليات"}
          </Link>
          <Link
            to="/events/create"
            className={cn(
              "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
              "text-muted-foreground"
            )}
          >
            <Plus className="h-4 w-4" />
            {!isMobile && "إنشاء فعالية"}
          </Link>
          <Link
            to="/create-project"
            className={cn(
              "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
              "text-muted-foreground"
            )}
          >
            <Plus className="h-4 w-4" />
            {!isMobile && "إنشاء مشروع"}
          </Link>
        </div>
      </div>
    </div>
  );
};