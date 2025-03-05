
import { ProjectWithTasks } from "../types/yearlyPlanTypes";
import { getProjectStatusColor } from "../utils/statusColors";
import { formatDateRange } from "../utils/dateUtils";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskRow } from "./TaskRow";
import { ProjectTimeline } from "./ProjectTimeline";

interface ProjectRowProps {
  project: ProjectWithTasks;
  months: Date[];
  today: Date;
  onToggleExpand: () => void;
}

export const ProjectRow = ({ project, months, today, onToggleExpand }: ProjectRowProps) => {
  if (!project.start_date || !project.end_date) return null;
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'مكتمل';
      case 'in_progress': return 'قيد التنفيذ';
      case 'pending': return 'قيد الانتظار';
      case 'delayed': return 'متعثر';
      case 'stopped': return 'متوقف';
      default: return 'غير محدد';
    }
  };
  
  return (
    <div className="my-2 space-y-2">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onToggleExpand}
          className="p-1 h-6 w-6"
        >
          {project.expanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
        
        <div className="w-48 font-medium flex items-center gap-2">
          <div 
            className="w-2 h-2 rounded-full" 
            style={{ backgroundColor: getProjectStatusColor(project.status) }}
          />
          <span className="truncate">{project.name}</span>
        </div>
        
        <div className="flex-1 flex">
          {/* عرض شريط المشروع */}
          <ProjectTimeline 
            project={project}
            months={months}
            today={today}
          />
        </div>
      </div>
      
      {/* معلومات المشروع */}
      <div className="pl-6 flex items-center text-sm text-gray-600">
        <div className="w-48">
          <span className="inline-block px-2 py-0.5 rounded-full text-xs" style={{ 
            backgroundColor: `${getProjectStatusColor(project.status)}20`,
            color: getProjectStatusColor(project.status)
          }}>
            {getStatusLabel(project.status)}
          </span>
        </div>
        <div className="flex-1 flex items-center justify-between pr-4">
          <div className="text-xs">{formatDateRange(project.start_date, project.end_date)}</div>
          <div className="text-xs">
            {project.completedTasksCount}/{project.totalTasksCount} مهمة
            {project.overdueTasksCount > 0 && (
              <span className="text-red-500 mr-1">
                ({project.overdueTasksCount} متأخرة)
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* قائمة المهام عند التوسيع */}
      {project.expanded && project.tasks.length > 0 && (
        <div className="pl-10 space-y-1 mt-2">
          {project.tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              months={months}
              today={today}
            />
          ))}
        </div>
      )}
    </div>
  );
};
