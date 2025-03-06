
import { formatRelative } from "@/utils/formatters";
import { FileText, User, CalendarIcon } from "lucide-react";

interface TaskProjectCardFooterProps {
  dueDate: string | null;
  projectOwner: string | null;
  isDraft?: boolean;
}

export const TaskProjectCardFooter = ({ dueDate, projectOwner, isDraft }: TaskProjectCardFooterProps) => {
  return (
    <div className="px-6 py-3 bg-gray-50 border-t flex justify-between items-center text-gray-500 text-sm">
      <div className="flex items-center gap-1">
        <CalendarIcon className="h-4 w-4" />
        <span>{formatRelative(dueDate)}</span>
      </div>
      
      <div className="flex items-center gap-1">
        {isDraft ? (
          <>
            <FileText className="h-4 w-4" />
            <span>تحت الإعداد</span>
          </>
        ) : (
          <>
            <User className="h-4 w-4" />
            <span>{projectOwner || "غير محدد"}</span>
          </>
        )}
      </div>
    </div>
  );
};
