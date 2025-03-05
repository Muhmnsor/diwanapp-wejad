
import { ProjectWithTasks } from "../types/yearlyPlanTypes";
import { 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay,
  isBefore,
  isAfter,
  format,
  differenceInDays
} from "date-fns";
import { getProjectStatusColor } from "../utils/statusColors";

interface ProjectTimelineProps {
  project: ProjectWithTasks;
  months: Date[];
  today: Date;
}

export const ProjectTimeline = ({ project, months, today }: ProjectTimelineProps) => {
  if (!project.start_date || !project.end_date) return null;
  
  const projectStartDate = new Date(project.start_date);
  const projectEndDate = new Date(project.end_date);
  
  return (
    <div className="flex-1 relative">
      <div className="flex h-8">
        {months.map((month, monthIndex) => {
          const daysInMonth = eachDayOfInterval({
            start: startOfMonth(month),
            end: endOfMonth(month)
          });
          
          // تحديد ما إذا كان المشروع يقع في هذا الشهر
          const projectStartsInMonth = projectStartDate.getMonth() === month.getMonth() && 
                                     projectStartDate.getFullYear() === month.getFullYear();
          
          const projectEndsInMonth = projectEndDate.getMonth() === month.getMonth() && 
                                   projectEndDate.getFullYear() === month.getFullYear();
          
          const projectSpansMonth = (isBefore(month, projectEndDate) || isSameDay(month, projectEndDate)) && 
                                   (isAfter(endOfMonth(month), projectStartDate) || isSameDay(endOfMonth(month), projectStartDate));
          
          if (!projectSpansMonth) {
            return (
              <div 
                key={monthIndex} 
                className="flex-1 h-full border-r"
              />
            );
          }
          
          // حساب موضع شريط المشروع
          const monthStartDay = startOfMonth(month);
          const monthEndDay = endOfMonth(month);
          const daysInMonthCount = daysInMonth.length;
          
          let startPosition = 0;
          if (projectStartsInMonth) {
            startPosition = (projectStartDate.getDate() - 1) / daysInMonthCount * 100;
          }
          
          let endPosition = 100;
          if (projectEndsInMonth) {
            endPosition = projectEndDate.getDate() / daysInMonthCount * 100;
          }
          
          const width = endPosition - startPosition;
          
          return (
            <div key={monthIndex} className="flex-1 h-full relative border-r">
              {daysInMonth.map((day, dayIndex) => (
                <div 
                  key={dayIndex} 
                  className={`flex-1 h-full ${
                    isSameDay(day, today) ? 'bg-yellow-100' : ''
                  }`}
                  style={{ width: `${100/daysInMonthCount}%`, height: '100%', position: 'absolute', left: `${dayIndex * (100/daysInMonthCount)}%` }}
                />
              ))}
              
              <div
                style={{
                  position: 'absolute',
                  left: `${startPosition}%`,
                  width: `${width}%`,
                  backgroundColor: getProjectStatusColor(project.status),
                  height: '70%',
                  top: '15%',
                  borderRadius: '4px',
                  opacity: 0.8
                }}
                title={`${project.name} (${format(projectStartDate, 'yyyy/MM/dd')} - ${format(projectEndDate, 'yyyy/MM/dd')})`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
