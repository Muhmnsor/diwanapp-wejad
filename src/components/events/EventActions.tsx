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
  return (
    <div className="flex gap-2">
      <ShareButton 
        title={eventTitle}
        text={eventDescription}
        url={window.location.href}
        onShare={onShare}
      />
      <Button 
        variant="outline" 
        size="icon" 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onAddToCalendar();
        }}
        className="w-8 h-8"
      >
        <CalendarPlus className="h-4 w-4" />
      </Button>
    </div>
  );
};