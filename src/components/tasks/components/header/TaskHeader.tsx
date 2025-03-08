
import { GitMerge, Link2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TaskPriorityBadge } from "../priority/TaskPriorityBadge";
import { TaskStatusBadge } from "../status/TaskStatusBadge";
import { Task } from "../../types/task";
import { Button } from "@/components/ui/button";

interface TaskHeaderProps {
  task: Task;
  status: string;
  onShowDependencies?: () => void;
  hasDependencies?: boolean;
  dependencyIconColor?: string;
}

export const TaskHeader = ({ 
  task, 
  status, 
  onShowDependencies,
  hasDependencies = false,
  dependencyIconColor = 'text-gray-500'
}: TaskHeaderProps) => {
  return (
    <div className="flex justify-between items-start">
      <div>
        {task.is_subtask && (
          <div className="flex items-center gap-1 mb-1">
            <GitMerge className="h-4 w-4 text-blue-500" />
            <Badge variant="outline" className="text-xs bg-blue-50">مهمة فرعية</Badge>
          </div>
        )}
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-lg">{task.title}</h3>
          {onShowDependencies && (
            <Button
              variant="ghost"
              size="sm"
              className="p-0 h-6 w-6"
              onClick={onShowDependencies}
              title="إدارة اعتماديات المهمة"
            >
              <Link2 className={`h-4 w-4 ${dependencyIconColor}`} />
            </Button>
          )}
        </div>
        {task.description && (
          <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{task.description}</p>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <TaskStatusBadge status={status} dueDate={task.due_date} />
        <TaskPriorityBadge priority={task.priority} />
      </div>
    </div>
  );
};
