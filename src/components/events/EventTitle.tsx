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
  console.log('EventTitle - isAdmin:', isAdmin);

  return (
    <div className="flex justify-between items-start px-8 py-6">
      <h1 className="text-[32px] leading-tight font-semibold text-[#1A1F2C]">{title}</h1>
      <div className="flex gap-3">
        {isAdmin && (
          <>
            <Button 
              variant="outline" 
              size="icon"
              className="rounded-full hover:bg-gray-100"
              onClick={onEdit}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button 
              variant="destructive" 
              size="icon"
              className="rounded-full"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
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