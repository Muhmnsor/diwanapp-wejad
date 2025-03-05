
import { Task } from "@/types/workspace";
import { 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay,
  isBefore,
  isAfter,
  format 
} from "date-fns";
import { getTaskStatusColor } from "../utils/statusColors";

interface TaskTimelineProps {
  task: Task;
  months: Date[];
  today: Date;
}

export const TaskTimeline = ({ task, months, today }: TaskTimelineProps) => {
  if (!task.start_date || !task.end_date) return null;
  
  const taskStartDate = new Date(task.start_date);
  const taskEndDate = new Date(task.end_date);
  
  return (
    <div className="flex-1 relative">
      <div className="flex h-4">
        {months.map((month, monthIndex) => {
          const daysInMonth = eachDayOfInterval({
            start: startOfMonth(month),
            end: endOfMonth(month)
          });
          
          // تحديد ما إذا كانت المهمة تقع في هذا الشهر
          const taskStartsInMonth = taskStartDate.getMonth() === month.getMonth() && 
                                  taskStartDate.getFullYear() === month.getFullYear();
          
          const taskEndsInMonth = taskEndDate.getMonth() === month.getMonth() && 
                                taskEndDate.getFullYear() === month.getFullYear();
          
          const taskSpansMonth = (isBefore(month, taskEndDate) || isSameDay(month, taskEndDate)) && 
                               (isAfter(endOfMonth(month), taskStartDate) || isSameDay(endOfMonth(month), taskStartDate));
          
          if (!taskSpansMonth) {
            return (
              <div 
                key={monthIndex} 
                className="flex-1 h-full border-r"
              />
            );
          }
          
          // حساب موضع شريط المهمة
          const monthStartDay = startOfMonth(month);
          const monthEndDay = endOfMonth(month);
          const daysInMonthCount = daysInMonth.length;
          
          let startPosition = 0;
          if (taskStartsInMonth) {
            startPosition = (taskStartDate.getDate() - 1) / daysInMonthCount * 100;
          }
          
          let endPosition = 100;
          if (taskEndsInMonth) {
            endPosition = taskEndDate.getDate() / daysInMonthCount * 100;
          }
          
          const width = endPosition - startPosition;
          
          return (
            <div key={monthIndex} className="flex-1 h-full relative border-r">
              <div
                style={{
                  position: 'absolute',
                  left: `${startPosition}%`,
                  width: `${width}%`,
                  backgroundColor: getTaskStatusColor(task.status),
                  height: '70%',
                  top: '15%',
                  borderRadius: '3px',
                  opacity: 0.7
                }}
                title={`${task.title} (${format(taskStartDate, 'yyyy/MM/dd')} - ${format(taskEndDate, 'yyyy/MM/dd')})`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
