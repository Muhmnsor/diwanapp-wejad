import { Button } from "@/components/ui/button";
import { ShareButton } from "./ShareButton";
import { CalendarDays, Edit2, Trash2, Eye, EyeOff } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface EventTitleProps {
  title: string;
  isAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onAddToCalendar: () => void;
  isVisible?: boolean;
  onVisibilityChange?: (visible: boolean) => void;
}

export const EventTitle = ({
  title,
  isAdmin,
  onEdit,
  onDelete,
  onAddToCalendar,
  isVisible = true,
  onVisibilityChange,
}: EventTitleProps) => {
  const isMobile = useIsMobile();
  console.log('EventTitle - isAdmin:', isAdmin);
  console.log('EventTitle - isVisible:', isVisible);

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-4 md:px-8 py-6 border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10 gap-4" dir="rtl">
      <h1 className="text-2xl md:text-[32px] leading-tight font-semibold text-[#1A1F2C] order-1">{title}</h1>
      <div className="flex gap-2 order-2 flex-wrap">
        {isAdmin && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={onEdit}
              className="w-8 h-8"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={onDelete}
              className="w-8 h-8"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            {onVisibilityChange && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => onVisibilityChange(!isVisible)}
                className="w-8 h-8"
                title={isVisible ? "إخفاء الفعالية" : "إظهار الفعالية"}
              >
                {isVisible ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        )}
        <ShareButton url={window.location.href} title={title} />
        <Button
          variant="outline"
          size="icon"
          onClick={onAddToCalendar}
          className="w-8 h-8"
        >
          <CalendarDays className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};