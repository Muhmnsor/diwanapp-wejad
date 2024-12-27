import { CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareButton } from "./ShareButton";

interface EventActionsProps {
  onShare: () => Promise<void>;
  onAddToCalendar: () => void;
  eventTitle?: string;
  eventDescription?: string;
  isAdmin?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const EventActions = ({ 
  onAddToCalendar, 
  eventTitle,
  eventDescription,
  onShare,
  isAdmin,
  onEdit,
  onDelete
}: EventActionsProps) => {
  return (
    <div className="flex gap-2">
      <ShareButton 
        title={eventTitle}
        text={eventDescription}
        url={window.location.href}
        onShare={onShare}
      />
      <Button variant="outline" size="icon" onClick={onAddToCalendar}>
        <CalendarPlus className="h-4 w-4" />
      </Button>
      {isAdmin && (
        <>
          {onEdit && (
            <Button variant="outline" size="icon" onClick={onEdit}>
              تعديل
            </Button>
          )}
          {onDelete && (
            <Button variant="destructive" size="icon" onClick={onDelete}>
              حذف
            </Button>
          )}
        </>
      )}
    </div>
  );
};