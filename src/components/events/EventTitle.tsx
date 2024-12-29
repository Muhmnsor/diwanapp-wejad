import { Button } from "@/components/ui/button";
import { CalendarPlus, Pencil, Trash } from "lucide-react";

interface EventTitleProps {
  title: string;
  isAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onAddToCalendar: () => void;
  isProject?: boolean;
}

export const EventTitle = ({
  title,
  isAdmin,
  onEdit,
  onDelete,
  onAddToCalendar,
  isProject = false
}: EventTitleProps) => {
  return (
    <div className="p-6 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <h1 className="text-2xl font-bold">
        {isProject ? "مشروع: " : ""}{title}
      </h1>
      
      <div className="flex items-center gap-2">
        {isAdmin && (
          <>
            <Button
              variant="outline"
              size="icon"
              onClick={onEdit}
              className="h-8 w-8"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={onDelete}
              className="h-8 w-8"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </>
        )}
        {!isProject && (
          <Button
            variant="outline"
            size="icon"
            onClick={onAddToCalendar}
            className="h-8 w-8"
          >
            <CalendarPlus className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};