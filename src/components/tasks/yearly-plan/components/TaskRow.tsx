
import { Task } from "@/types/workspace";
import { getTaskStatusColor } from "../utils/statusColors";
import { TaskTimeline } from "./TaskTimeline";

interface TaskRowProps {
  task: Task;
  months: Date[];
  today: Date;
}

export const TaskRow = ({ task, months, today }: TaskRowProps) => {
  if (!task.start_date || !task.end_date) return null;
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'مكتمل';
      case 'in_progress': return 'قيد التنفيذ';
      case 'pending': return 'قيد الانتظار';
      default: return 'غير محدد';
    }
  };
  
  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'مرتفعة';
      case 'medium': return 'متوسطة';
      case 'low': return 'منخفضة';
      default: return 'غير محدد';
    }
  };
  
  return (
    <div className="flex items-center py-1 hover:bg-gray-50 rounded-md">
      <div className="w-48 flex items-center gap-1 pl-2">
        <div 
          className="w-1.5 h-1.5 rounded-full" 
          style={{ backgroundColor: getTaskStatusColor(task.status) }}
        />
        <span className="text-xs truncate">{task.title}</span>
      </div>
      
      <div className="flex-1 flex">
        <TaskTimeline 
          task={task}
          months={months}
          today={today}
        />
      </div>
    </div>
  );
};
