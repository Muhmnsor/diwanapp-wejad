import { Share2, CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface EventActionsProps {
  onShare: () => Promise<void>;
  onAddToCalendar: () => void;
}

export const EventActions = ({ onShare, onAddToCalendar }: EventActionsProps) => {
  return (
    <div className="flex gap-2">
      <Button variant="outline" size="icon" onClick={onShare}>
        <Share2 className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon" onClick={onAddToCalendar}>
        <CalendarPlus className="h-4 w-4" />
      </Button>
    </div>
  );
};