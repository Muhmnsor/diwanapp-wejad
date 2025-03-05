
import { Task } from "../../types/task";
import { TaskMetadata } from "../metadata/TaskMetadata";

interface TaskDiscussionHeaderProps {
  task: Task;
}

export const TaskDiscussionHeader = ({ task }: TaskDiscussionHeaderProps) => {
  return (
    <div>
      <h2 className="text-lg font-semibold">{task.title}</h2>
      {task.description && (
        <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
      )}
      <div className="mt-3">
        <TaskMetadata 
          dueDate={task.due_date} 
          projectName={task.project_name}
          isSubtask={!!task.is_subtask} 
          parentTaskId={task.parent_task_id}
          taskId={task.id}
        />
      </div>
    </div>
  );
};
