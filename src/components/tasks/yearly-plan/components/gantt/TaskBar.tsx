
import { getDaysInMonth, startOfMonth, endOfMonth } from 'date-fns';
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
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  
  if (
    (endDate < monthStart) || 
    (startDate > monthEnd)
  ) {
    return null; // Task doesn't overlap with this month
  }
  
  // Calculate position and width
  const daysInMonth = getDaysInMonth(month);
  const monthStartDay = monthStart.getDate();
  
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
  
  // Calculate progress value (between 0-100)
  // Assuming task has completion_percentage field, default to 0 if not present
  const progressValue = task.completion_percentage || 0;
  
  // Get base color based on status
  const statusColor = getTaskStatusColor(task.status);
  
  // Define progress bar background color (lighter version of status color)
  const progressBgColor = statusColor.replace('bg-', 'bg-').concat('/30');
  
  return (
    <div 
      style={{
        left: `${left}%`,
        width: `${width}%`,
        height: '18px',
      }}
      className="absolute rounded-md"
      title={`${task.title} (${
        task.priority === 'high' ? 'مرتفعة' : 
        task.priority === 'medium' ? 'متوسطة' : 
        'منخفضة'
      })`}
    >
      {/* Background bar (full project timeline) */}
      <div className={`absolute inset-0 ${progressBgColor} rounded-md`} />
      
      {/* Progress bar (completed portion) */}
      <div 
        className={`absolute top-0 left-0 h-full ${statusColor} rounded-md transition-all duration-300`}
        style={{ width: `${progressValue}%` }}
      />
    </div>
  );
};
