
import { 
  CalendarIcon,
  Clock as ClockIcon,
  Rocket
} from "lucide-react";
import { formatDate, getTimeFromNow, getRemainingDays } from "@/utils/formatters";
import { differenceInDays } from "date-fns";

interface ProjectDateInfoProps {
  createdAt?: string;
  dueDate: string | null;
  launchDate?: string | null;
  isDraft?: boolean;
}

export const ProjectDateInfo = ({ createdAt, dueDate, launchDate, isDraft }: ProjectDateInfoProps) => {
  const remainingDays = getRemainingDays(dueDate);
  
  // Calculate total project days
  const calculateTotalDays = (): number | null => {
    if (!createdAt || !dueDate) return null;
    
    try {
      const startDate = new Date(createdAt);
      const endDate = new Date(dueDate);
      return differenceInDays(endDate, startDate) + 1; // +1 to include the start day
    } catch (error) {
      console.error("Error calculating total days:", error);
      return null;
    }
  };
  
  const totalDays = calculateTotalDays();

  return (
    <div className="flex flex-wrap gap-3 bg-gray-50 p-3 rounded-md justify-center">
      <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-md">
        <CalendarIcon className="h-4 w-4 text-blue-700" />
        <span className="text-sm font-medium text-blue-900">
          <span className="text-xs text-blue-700 ml-1">تاريخ البدء:</span>
          {formatDate(createdAt)}
        </span>
      </div>
      
      <div className="flex items-center gap-2 bg-amber-50 px-3 py-2 rounded-md">
        <CalendarIcon className="h-4 w-4 text-amber-700" />
        <span className="text-sm font-medium text-amber-900">
          <span className="text-xs text-amber-700 ml-1">تاريخ الانتهاء:</span>
          {formatDate(dueDate)}
        </span>
      </div>
      
      {launchDate && !isDraft && (
        <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-md">
          <Rocket className="h-4 w-4 text-green-700" />
          <span className="text-sm font-medium text-green-900">
            <span className="text-xs text-green-700 ml-1">تاريخ الإطلاق:</span>
            {formatDate(launchDate)}
          </span>
        </div>
      )}
      
      {totalDays !== null && (
        <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-md">
          <ClockIcon className="h-4 w-4 text-green-700" />
          <span className="text-sm font-medium text-green-900">
            <span className="text-xs text-green-700 ml-1">المدة الإجمالية:</span>
            {totalDays} يوم
          </span>
        </div>
      )}
      
      {remainingDays !== null && (
        <div className="flex items-center gap-2 bg-purple-50 px-3 py-2 rounded-md">
          <ClockIcon className="h-4 w-4 text-purple-700" />
          <span className="text-sm font-medium text-purple-900">
            <span className="text-xs text-purple-700 ml-1">الأيام المتبقية:</span>
            {remainingDays} يوم
          </span>
        </div>
      )}
    </div>
  );
};
