
import { getTaskStatusColor } from '../../utils/dateUtils';
import { Progress } from '@/components/ui/progress';

interface TaskBarProps {
  task: any;
  month: Date;
  monthIndex: number;
}

export const TaskBar = ({ task, month, monthIndex }: TaskBarProps) => {
  const startDate = new Date(task.start_date);
  const endDate = new Date(task.due_date);
  
  // Check if task overlaps with this month
  const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
  const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  
  if (
    (endDate < monthStart) || 
    (startDate > monthEnd)
  ) {
    return null; // Task doesn't overlap with this month
  }
  
  // Calculate position and width
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  
  // Task starts before this month
  const leftDay = startDate < monthStart 
    ? 0 
    : startDate.getDate() - 1;
  
  // Task ends after this month
  const rightDay = endDate > monthEnd 
    ? daysInMonth 
    : endDate.getDate();
  
  const left = (leftDay / daysInMonth) * 100;
  const width = ((rightDay - leftDay) / daysInMonth) * 100;
  
  // Calculate progress percentage based on status
  let progressPercentage = 0;
  if (task.status === 'completed') {
    progressPercentage = 100;
  } else if (task.status === 'in_progress') {
    progressPercentage = 50;
  } else if (task.status === 'delayed') {
    progressPercentage = 30;
  }
  
  return (
    <div
      style={{
        left: `${left}%`,
        width: `${width}%`,
      }}
      className="absolute h-6 rounded-md overflow-hidden bg-blue-100"
      title={`${task.title} (${
        task.priority === 'high' ? 'مرتفعة' : 
        task.priority === 'medium' ? 'متوسطة' : 
        'منخفضة'
      })`}
    >
      <Progress 
        value={progressPercentage} 
        className="h-full bg-blue-100" 
      />
      <span className="absolute inset-0 flex items-center justify-center text-xs truncate px-2 text-slate-800">
        {task.title}
      </span>
    </div>
  );
};
