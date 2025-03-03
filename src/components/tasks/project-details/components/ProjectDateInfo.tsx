
import { 
  CalendarIcon,
  Clock as ClockIcon
} from "lucide-react";
import { format, formatDistanceToNow, differenceInDays } from "date-fns";
import { ar } from "date-fns/locale";

interface ProjectDateInfoProps {
  createdAt?: string;
  dueDate: string | null;
}

export const ProjectDateInfo = ({ createdAt, dueDate }: ProjectDateInfoProps) => {
  const getFormattedDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'غير محدد';
    
    try {
      const date = new Date(dateString);
      return format(date, 'dd/MM/yyyy', { locale: ar });
    } catch (error) {
      return 'تاريخ غير صالح';
    }
  };
  
  const getTimeToDeadline = (dateString: string | null) => {
    if (!dateString) return null;
    
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: ar });
    } catch (error) {
      return null;
    }
  };

  const getRemainingDays = (dateString: string | null) => {
    if (!dateString) return null;
    
    try {
      const dueDate = new Date(dateString);
      const today = new Date();
      const days = differenceInDays(dueDate, today);
      return days <= 0 ? 0 : days;
    } catch (error) {
      return null;
    }
  };
  
  const timeToDeadline = getTimeToDeadline(dueDate);
  const remainingDays = getRemainingDays(dueDate);

  return (
    <div className="flex flex-wrap gap-3 bg-gray-50 p-3 rounded-md">
      <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-md">
        <CalendarIcon className="h-4 w-4 text-blue-700" />
        <span className="text-sm font-medium text-blue-900">
          {getFormattedDate(createdAt)}
        </span>
      </div>
      
      <div className="flex items-center gap-2 bg-amber-50 px-3 py-2 rounded-md">
        <CalendarIcon className="h-4 w-4 text-amber-700" />
        <span className="text-sm font-medium text-amber-900">
          {getFormattedDate(dueDate)}
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
