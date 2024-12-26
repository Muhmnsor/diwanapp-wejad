import { Button } from "@/components/ui/button";
import { ShareButton } from "./ShareButton";
import { CalendarDays, Edit2, Trash2 } from "lucide-react";

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
  onAddToCalendar,
}: EventTitleProps) => {
  return (
    <div className="flex justify-between items-center px-8 py-6 border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10" dir="rtl">
      <h1 className="text-[32px] leading-tight font-semibold text-[#1A1F2C] order-1">{title}</h1>
      <div className="flex gap-3 order-2">
        {isAdmin && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={onEdit}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
        <ShareButton onShare={onShare} title={title} />
        <Button
          variant="outline"
          size="icon"
          onClick={onAddToCalendar}
        >
          <CalendarDays className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};