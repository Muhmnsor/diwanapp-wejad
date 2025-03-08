
import { GitMerge } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TaskPriorityBadge } from "../priority/TaskPriorityBadge";
import { TaskStatusBadge } from "../status/TaskStatusBadge";
import { Task } from "../../types/task";
import { Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TaskHeaderProps {
  task: Task;
  status: string;
  onDependenciesClick?: () => void;
  hasDependencies?: boolean;
  hasDependents?: boolean;
  dependencyIconColor?: string;
}

export const TaskHeader = ({ 
  task, 
  status, 
  onDependenciesClick, 
  hasDependencies, 
  hasDependents,
  dependencyIconColor = 'text-gray-500'
}: TaskHeaderProps) => {
  const handleDependenciesClick = (e: React.MouseEvent) => {
    if (e && onDependenciesClick) {
      e.stopPropagation();
      onDependenciesClick();
    }
  };

  return (
    <div className="flex justify-between items-start">
      {/* Status and priority badges - moved to far left and stacked */}
      <div className="flex flex-col gap-1">
        <TaskStatusBadge status={status} dueDate={task.due_date} />
        <TaskPriorityBadge priority={task.priority} />
      </div>

      <div>
        {task.is_subtask && (
          <div className="flex items-center gap-1 mb-1">
            <GitMerge className="h-4 w-4 text-blue-500" />
            <Badge variant="outline" className="text-xs bg-blue-50">مهمة فرعية</Badge>
          </div>
        )}
        <h3 className="font-semibold text-lg">{task.title}</h3>
        {task.description && (
          <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{task.description}</p>
        )}
      </div>
      
      {onDependenciesClick && (
        <Button
          variant="ghost"
          size="sm"
          className="p-0 h-7 w-7"
          onClick={handleDependenciesClick}
          title="إدارة اعتماديات المهمة"
        >
          <Link2 className={`h-4 w-4 ${dependencyIconColor}`} />
        </Button>
      )}
    </div>
  );
};
