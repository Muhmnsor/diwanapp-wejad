
import { GitMerge } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TaskPriorityBadge } from "../priority/TaskPriorityBadge";
import { TaskStatusBadge } from "../status/TaskStatusBadge";
import { Task } from "../../types/task";

interface TaskHeaderProps {
  task: Task;
  status: string;
}

export const TaskHeader = ({ task, status }: TaskHeaderProps) => {
  return (
    <div className="flex flex-row-reverse justify-between items-start">
      <div className="text-right">
        {task.is_subtask && (
          <div className="flex items-center gap-1 mb-1 justify-end">
            <Badge variant="outline" className="text-xs bg-blue-50">مهمة فرعية</Badge>
            <GitMerge className="h-4 w-4 text-blue-500" />
          </div>
        )}
        <h3 className="font-semibold text-lg">{task.title}</h3>
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
