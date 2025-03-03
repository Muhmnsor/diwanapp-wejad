
import { 
  CalendarIcon,
  Clock as ClockIcon
} from "lucide-react";
import { formatDate, getTimeFromNow, getRemainingDays } from "@/utils/formatters";

interface ProjectDateInfoProps {
  createdAt?: string;
  dueDate: string | null;
}

export const ProjectDateInfo = ({ createdAt, dueDate }: ProjectDateInfoProps) => {
  const timeToDeadline = getTimeFromNow(dueDate);
  const remainingDays = getRemainingDays(dueDate);

  return (
    <div className="flex flex-wrap gap-3 bg-gray-50 p-3 rounded-md">
      <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-md">
        <CalendarIcon className="h-4 w-4 text-blue-700" />
        <span className="text-sm font-medium text-blue-900">
          {formatDate(createdAt)}
        </span>
      </div>
      
      <div className="flex items-center gap-2 bg-amber-50 px-3 py-2 rounded-md">
        <CalendarIcon className="h-4 w-4 text-amber-700" />
        <span className="text-sm font-medium text-amber-900">
          {formatDate(dueDate)}
        </span>
      </div>
      
      {timeToDeadline && (
        <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-md">
          <ClockIcon className="h-4 w-4 text-green-700" />
          <span className="text-sm font-medium text-green-900">
            {timeToDeadline}
          </span>
        </div>
      )}
      
      {remainingDays !== null && (
        <div className="flex items-center gap-2 bg-purple-50 px-3 py-2 rounded-md">
          <ClockIcon className="h-4 w-4 text-purple-700" />
          <span className="text-sm font-medium text-purple-900">
            متبقي {remainingDays} يوم
          </span>
        </div>
      )}
    </div>
  );
};
