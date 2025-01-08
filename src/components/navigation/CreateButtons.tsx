import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CreateButtonsProps {
  isMobile: boolean;
}

export const CreateButtons = ({ isMobile }: CreateButtonsProps) => {
  return (
    <div className="flex gap-2">
      <Link to="/events/create">
        <Button 
          variant="outline" 
          size={isMobile ? "icon" : "sm"} 
          className={cn(
            "gap-2",
            isMobile ? "w-8 h-8 p-0" : ""
          )}
        >
          <Plus className="h-4 w-4" />
          {!isMobile && "إنشاء فعالية"}
        </Button>
      </Link>
      <Link to="/create-project">
        <Button 
          variant="outline" 
          size={isMobile ? "icon" : "sm"} 
          className={cn(
            "gap-2",
            isMobile ? "w-8 h-8 p-0" : ""
          )}
        >
          <Plus className="h-4 w-4" />
          {!isMobile && "إنشاء مشروع"}
        </Button>
      </Link>
    </div>
  );
};