import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { EventActions } from "./EventActions";

interface EventTitleProps {
  title: string;
  isAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onShare: () => Promise<void>;
  onAddToCalendar: () => void;
}

export const EventTitle = ({ 
  title, 
  isAdmin, 
  onEdit, 
  onDelete,
  onShare,
  onAddToCalendar 
}: EventTitleProps) => {
  return (
    <div className="flex justify-between items-start mb-6">
      <h1 className="text-3xl font-bold">{title}</h1>
      <div className="flex gap-2">
        {isAdmin && (
          <div className="flex gap-2 ml-4">
            <Button 
              variant="outline" 
              size="icon"
              onClick={onEdit}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button 
              variant="destructive" 
              size="icon"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
        <EventActions
          eventTitle={title}
          eventDescription=""
          onShare={onShare}
          onAddToCalendar={onAddToCalendar}
        />
      </div>
    </div>
  );
};