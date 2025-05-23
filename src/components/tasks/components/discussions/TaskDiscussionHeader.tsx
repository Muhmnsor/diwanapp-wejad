
import { Task } from "../../types/task";
import { TaskMetadata } from "../metadata/TaskMetadata";

interface TaskDiscussionHeaderProps {
  task: Task;
}

export const TaskDiscussionHeader = ({
  task
}: TaskDiscussionHeaderProps) => {
  return <div>
      <h2 className="text-lg font-semibold">{task.title}</h2>
      {task.description && <p className="text-muted-foreground mt-1 my-[3px] text-xs">{task.description}</p>}
      <div className="mt-3">
        <TaskMetadata 
          dueDate={task.due_date} 
          projectName={task.project_name} 
          isSubtask={!!task.is_subtask} 
          parentTaskId={task.parent_task_id} 
          isGeneral={task.is_general}
          requiresDeliverable={task.requires_deliverable}
        />
      </div>
    </div>;
};
