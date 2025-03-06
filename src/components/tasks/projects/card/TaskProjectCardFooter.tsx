
import { CardFooter } from "@/components/ui/card";
import { CalendarIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

interface TaskProjectCardFooterProps {
  dueDate: string | null;
  projectOwner: string | null;
}

export const TaskProjectCardFooter = ({ dueDate, projectOwner }: TaskProjectCardFooterProps) => {
  const getFormattedDate = (dateString: string | null) => {
    if (!dateString) return 'غير محدد';
    
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: ar });
    } catch (error) {
      return 'تاريخ غير صالح';
    }
  };

  return (
    <CardFooter className="px-6 py-4 border-t flex justify-between">
      <div className="flex items-center gap-1 text-sm text-gray-500">
        <CalendarIcon className="h-4 w-4" />
        <span>
          {dueDate ? getFormattedDate(dueDate) : 'غير محدد'}
        </span>
      </div>
      <div className="text-sm font-medium">
        {projectOwner || 'غير محدد'}
      </div>
    </CardFooter>
  );
};
