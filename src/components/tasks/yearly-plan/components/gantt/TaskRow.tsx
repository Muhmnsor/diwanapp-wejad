
import { format, getDaysInMonth, isWithinInterval, startOfMonth, endOfMonth, isSameDay } from 'date-fns';
import { getTaskStatusColor } from '../../utils/dateUtils';
import { TaskBar } from './TaskBar';

interface TaskRowProps {
  task: any;
  months: Date[];
  today: Date;
}

export const TaskRow = ({ task, months, today }: TaskRowProps) => {
  // Helper to check if a date falls within the task duration
  const isTaskActiveOnDay = (day: Date) => {
    if (!task.start_date || !task.due_date) return false;
    
    const taskStartDate = new Date(task.start_date);
    const taskEndDate = new Date(task.due_date);
    
    return isWithinInterval(day, { start: taskStartDate, end: taskEndDate }) ||
           isSameDay(day, taskStartDate) ||
           isSameDay(day, taskEndDate);
  };

  return (
    <div className="flex">
      <div className="w-48 flex-shrink-0 text-sm py-1 px-3">
        {task.title}
      </div>
      <div className="flex-1 flex">
        {months.map((month, monthIndex) => {
          const daysInMonth = getDaysInMonth(month);
          
          return (
            <div key={monthIndex} className="flex-1 relative">
              <div className="flex h-8 border-r">
                {Array.from({ length: daysInMonth }).map((_, dayIndex) => {
                  const currentDay = new Date(month.getFullYear(), month.getMonth(), dayIndex + 1);
                  const isCurrentDay = isSameDay(currentDay, today);
                  
                  return (
                    <div 
                      key={dayIndex} 
                      className={`flex-1 h-full ${
                        isCurrentDay ? 'bg-yellow-100' : ''
                      }`}
                    />
                  );
                })}
              </div>
              
              <div className="relative h-6 mt-2">
                {task.start_date && task.due_date && (
                  <TaskBar
                    task={task}
                    month={month}
                    monthIndex={monthIndex}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
