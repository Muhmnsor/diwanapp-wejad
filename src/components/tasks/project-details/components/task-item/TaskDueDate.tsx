
import { Calendar } from "lucide-react";

interface TaskDueDateProps {
  dueDate: string | null | undefined;
  formatDate: (date: string | null) => string;
}

export const TaskDueDate = ({ dueDate, formatDate }: TaskDueDateProps) => {
  if (!dueDate) return null;
  
  return (
    <div className="flex items-center">
      <Calendar className="h-3.5 w-3.5 ml-1.5 text-gray-500" />
      {formatDate(dueDate)}
    </div>
  );
};
