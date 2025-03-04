
import { Project } from "@/types/project";
import { eachDayOfInterval, startOfMonth, endOfMonth, isSameDay, isWithinInterval } from "date-fns";
import { getTaskStatusColor } from "../utils/dateUtils";

interface ProjectTasksRowProps {
  project: Project;
  months: Date[];
  today: Date;
}

export const ProjectTasksRow = ({ project, months, today }: ProjectTasksRowProps) => {
  const projectStartDate = new Date(project.start_date);
  const projectEndDate = new Date(project.end_date);
  const projectStatus = determineProjectStatus(project);
  
  // Determine project category based on event_path
  const getProjectCategory = () => {
    if (project.event_path === "individual_event") {
      return "الفعاليات المنفردة";
    } else if (project.event_path === "task_project") {
      return "مشاريع المهام";
    } else {
      return "المشاريع";
    }
  };
  
  return (
    <div className="space-y-2">
      <div className="flex">
        <div className="w-48 flex-shrink-0 font-medium cursor-pointer flex flex-col" 
             onClick={() => window.location.href = `/projects/${project.id}`}>
          <span className="text-xs text-gray-500 mb-1">{getProjectCategory()}</span>
          <span>{project.title}</span>
        </div>
        <div className="flex-1 flex">
          {months.map((month, monthIndex) => {
            const daysInMonth = eachDayOfInterval({
              start: startOfMonth(month),
              end: endOfMonth(month)
            });
            
            return (
              <div key={monthIndex} className="flex-1 relative">
                <div className="flex h-8 border-r">
                  {daysInMonth.map((day, dayIndex) => (
                    <div 
                      key={dayIndex} 
                      className={`flex-1 h-full ${
                        isSameDay(day, today) ? 'bg-yellow-100' : ''
                      }`}
                    />
                  ))}
                </div>
                
                <div className="relative h-8 mt-1">
                  {isProjectInMonth(project, month) && (
                    <div
                      style={{
                        ...calculateProjectPosition(project, daysInMonth)
                      }}
                      className={`absolute h-6 rounded-md px-1 text-xs text-white flex items-center overflow-hidden ${getTaskStatusColor(projectStatus)}`}
                      title={`${project.title} (${formatProjectDates(project)})`}
                    >
                      <span className="truncate">{project.title}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Helper functions
function isProjectInMonth(project: Project, month: Date): boolean {
  const projectStartDate = new Date(project.start_date);
  const projectEndDate = new Date(project.end_date);
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  
  return (
    (projectStartDate <= monthEnd && projectEndDate >= monthStart) ||
    (projectStartDate.getMonth() === month.getMonth() && projectStartDate.getFullYear() === month.getFullYear()) ||
    (projectEndDate.getMonth() === month.getMonth() && projectEndDate.getFullYear() === month.getFullYear())
  );
}

function calculateProjectPosition(project: Project, daysInMonth: Date[]) {
  const projectStartDate = new Date(project.start_date);
  const projectEndDate = new Date(project.end_date);
  const monthStart = daysInMonth[0];
  const monthEnd = daysInMonth[daysInMonth.length - 1];
  
  // Calculate positions for projects that span beyond the month
  const startPosition = projectStartDate < monthStart 
    ? 0 
    : (projectStartDate.getDate() - 1) / daysInMonth.length * 100;
    
  const endDayInMonth = projectEndDate > monthEnd 
    ? daysInMonth.length 
    : projectEndDate.getDate();
    
  const width = endDayInMonth / daysInMonth.length * 100 - startPosition;
  
  return {
    left: `${startPosition}%`,
    width: `${width}%`,
  };
}

function determineProjectStatus(project: Project): string {
  const today = new Date();
  const projectStartDate = new Date(project.start_date);
  const projectEndDate = new Date(project.end_date);
  
  if (today < projectStartDate) {
    return 'pending';
  } else if (today > projectEndDate) {
    return 'completed';
  } else {
    return 'in_progress';
  }
}

function formatProjectDates(project: Project): string {
  const startDate = new Date(project.start_date).toLocaleDateString('ar-SA');
  const endDate = new Date(project.end_date).toLocaleDateString('ar-SA');
  return `${startDate} - ${endDate}`;
}
