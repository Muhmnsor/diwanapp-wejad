
import { Button } from "@/components/ui/button";
import { ShareButton } from "./ShareButton";
import { CalendarDays, Edit2, Trash2, Eye, EyeOff } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { EventDeleteDialog } from "./details/EventDeleteDialog";
import { handleEventDelete } from "./details/handlers/EventDeleteHandler";
import { useNavigate } from "react-router-dom";
import { EventCalendarHelper } from "./EventCalendarHelper";
import { Event } from "@/store/eventStore";

interface EventTitleProps {
  title: string;
  event: Event;
  isAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onAddToCalendar: () => void;
  isVisible?: boolean;
  onVisibilityChange?: (visible: boolean) => void;
}

export const EventTitle = ({
  title,
  event,
  isAdmin,
  onEdit,
  onDelete,
  onAddToCalendar,
  isVisible = true,
  onVisibilityChange,
}: EventTitleProps) => {
  const isMobile = useIsMobile();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const navigate = useNavigate();
  
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const eventId = window.location.pathname.split('/').pop() || '';
      await handleEventDelete({
        id: eventId,
        onSuccess: () => {
          setShowDeleteDialog(false);
          navigate('/', { replace: true });
        }
      });
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

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
              onClick={handleDeleteClick}
              className="w-8 h-8"
              title="حذف الفعالية"
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
        <EventCalendarHelper 
          title={event.title}
          description={event.description || ''}
          location={event.location}
          startDate={event.date}
          endDate={event.end_date}
          time={event.time}
        />
        <ShareButton url={window.location.href} title={title} />
      </div>

      <EventDeleteDialog
        eventId={window.location.pathname.split('/').pop() || ''}
        isOpen={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleConfirmDelete}
        title={title}
      />
    </div>
  );
};
