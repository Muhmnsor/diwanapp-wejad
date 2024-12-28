import { CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareButton } from "./ShareButton";

interface EventActionsProps {
  onShare: () => Promise<void>;
  onAddToCalendar: () => void;
  eventTitle?: string;
  eventDescription?: string;
}

export const EventActions = ({ 
  onAddToCalendar, 
  eventTitle,
  eventDescription,
  onShare
}: EventActionsProps) => {
  const handleCalendarClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCalendar();
  };

  return (
    <div className="flex gap-2 pointer-events-auto">
      <ShareButton 
        title={eventTitle}
        text={eventDescription}
        url={window.location.href}
        onShare={onShare}
      />
      <Button 
        variant="outline" 
        size="icon"
        onClick={handleCalendarClick}
        className="w-8 h-8 relative z-10"
      >
        <CalendarPlus className="h-4 w-4" />
      </Button>
    </div>
  );
};