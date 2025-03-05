
import { ArrowRight, ExternalLink } from "lucide-react";
import { TaskPriorityBadge } from "../priority/TaskPriorityBadge";
import { TaskStatusBadge } from "../status/TaskStatusBadge";
import { TaskDetailPopover } from "../TaskDetailPopover";
import { Task } from "../../types/task";
import { TaskMetadata } from "../metadata/TaskMetadata";

interface TaskHeaderProps {
  task: Task;
  compact?: boolean;
}

export const TaskHeader = ({ task, compact = false }: TaskHeaderProps) => {
  return (
    <div className="flex justify-between items-start">
      <div>
        <div className="flex items-center gap-2">
          <h3 className={`font-medium ${compact ? "text-base" : "text-lg"}`}>{task.title}</h3>
          {task.parent_task_id && (
            <span className="text-xs text-primary flex items-center gap-1">
              <ArrowRight className="h-3 w-3" />
              مهمة فرعية
            </span>
          )}
          {task.project_id && task.external_url && (
            <a
              href={task.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-500 flex items-center gap-0.5"
            >
              <ExternalLink className="h-3 w-3" />
              عرض
            </a>
          )}
        </div>
        {task.description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
        )}
        
        <div className="mt-2">
          <TaskMetadata 
            dueDate={task.due_date} 
            projectName={task.project_name} 
            isSubtask={!!task.parent_task_id}
            parentTaskId={task.parent_task_id}
            taskId={task.id}
          />
        </div>
      </div>
      
      <div className="flex flex-col items-end gap-2">
        <div className="flex gap-2">
          <TaskPriorityBadge priority={task.priority} />
          <TaskStatusBadge status={task.status} />
        </div>
        <TaskDetailPopover task={task} />
      </div>
    </div>
  );
};
