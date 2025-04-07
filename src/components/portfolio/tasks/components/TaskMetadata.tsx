
import { CalendarIcon, Clock, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

interface TaskMetadataProps {
  dueDate: string | null;
  assignedTo: string | null;
  assignedName?: string | null;
  updatedAt: string;
  taskId: string;
}

export const TaskMetadata = ({ 
  dueDate, 
  assignedTo,
  assignedName,
  updatedAt, 
  taskId 
}: TaskMetadataProps) => {
  const formatDueDate = (date: string | null) => {
    if (!date) return 'لم يتم تحديد تاريخ';
    
    try {
      return formatDistanceToNow(new Date(date), { 
        addSuffix: true,
        locale: ar 
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'تاريخ غير صالح';
    }
  };
  
  const formatUpdatedAt = (date: string) => {
    try {
      return `آخر تحديث: ${formatDistanceToNow(new Date(date), { 
        addSuffix: true,
        locale: ar 
      })}`;
    } catch (error) {
      return 'وقت غير معروف';
    }
  };

  return (
    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
      {dueDate && (
        <div className="flex items-center">
          <CalendarIcon className="h-4 w-4 mr-1" />
          {formatDueDate(dueDate)}
        </div>
      )}
      
      {assignedTo && (
        <div className="flex items-center">
          <User className="h-4 w-4 mr-1" />
          {assignedName || 'شخص ما'}
        </div>
      )}
      
      <div className="flex items-center">
        <Clock className="h-4 w-4 mr-1" />
        {formatUpdatedAt(updatedAt)}
      </div>
    </div>
  );
};
