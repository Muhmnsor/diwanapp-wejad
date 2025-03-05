
import { getDaysInMonth, startOfMonth, endOfMonth } from 'date-fns';
import { getTaskStatusColor, getTimeBasedProgress } from '../../utils/dateUtils';

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
  // First use completion_percentage if available, otherwise calculate based on time
  const progressValue = task.completion_percentage !== undefined && task.completion_percentage !== null
    ? task.completion_percentage
    : getTimeBasedProgress(startDate, endDate);
  
  // Get base color based on status
  const statusColor = getTaskStatusColor(task.status);
  
  // Format the percentage display value - ensure it's a whole number
  const displayPercentage = Math.round(progressValue);
  
  return (
    <div 
      style={{
        left: `${left}%`,
        width: `${width}%`,
        height: '24px',
      }}
      className="absolute rounded-md"
      title={`${task.title} (${
        task.priority === 'high' ? 'مرتفعة' : 
        task.priority === 'medium' ? 'متوسطة' : 
        'منخفضة'
      })`}
    >
      {/* Background bar (full project timeline) */}
      <div className={`absolute inset-0 ${statusColor.replace('bg-', 'bg-').concat('/20')} rounded-md border border-gray-300`} />
      
      {/* Progress bar (completed portion) */}
      <div 
        className={`absolute top-0 left-0 h-full ${statusColor} rounded-md transition-all duration-300`}
        style={{ width: `${displayPercentage}%` }}
      />
      
      {/* Small label showing percentage */}
      <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center text-xs font-medium">
        <span className={`${displayPercentage > 50 ? 'text-white' : 'text-gray-700'}`}>
          {displayPercentage}%
        </span>
      </div>
    </div>
  );
};
