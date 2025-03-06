
import { getDaysInMonth, startOfMonth, endOfMonth } from 'date-fns';
import { getTaskStatusColor } from '../../utils/dateUtils';

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
  
  return (
    <div
      style={{
        left: `${left}%`,
        width: `${width}%`,
      }}
      className={`absolute h-6 rounded-md px-1 text-xs text-white flex items-center overflow-hidden ${getTaskStatusColor(task.status)}`}
      title={`${task.title} (${
        task.priority === 'high' ? 'مرتفعة' : 
        task.priority === 'medium' ? 'متوسطة' : 
        'منخفضة'
      })`}
    >
      <span className="truncate">{task.title}</span>
    </div>
  );
};
