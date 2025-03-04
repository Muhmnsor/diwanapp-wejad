
import { useState } from "react";
import { Task } from "../types/task";
import { Card, CardContent } from "@/components/ui/card";
import { TaskHeader } from "./header/TaskHeader";
import { TaskMetadata } from "./metadata/TaskMetadata";
import { TaskActions } from "./actions/TaskActions";
import { TaskDiscussionDialog } from "./TaskDiscussionDialog";

interface TaskListItemProps {
  task: Task;
}

export const TaskListItem = ({ task }: TaskListItemProps) => {
  const [status, setStatus] = useState(task.status);
  const [showDiscussion, setShowDiscussion] = useState(false);

  const getBorderStyle = () => {
    if (task.is_subtask) {
      return "hover:shadow-md transition-shadow border-r-4 border-r-blue-400 bg-blue-50";
    }
    return "hover:shadow-md transition-shadow";
  };

  return (
    <>
      <Card className={getBorderStyle()}>
        <CardContent className="p-5">
          <div className="flex flex-col gap-3">
            <TaskHeader task={task} status={status} />
            
            <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
              <TaskMetadata 
                dueDate={task.due_date}
                projectName={task.project_name}
                isSubtask={task.is_subtask || false}
                parentTaskId={task.parent_task_id}
              />
              
              <TaskActions 
                task={task}
                status={status}
                setStatus={setStatus}
                onShowDiscussion={() => setShowDiscussion(true)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <TaskDiscussionDialog 
        open={showDiscussion}
        onOpenChange={setShowDiscussion}
        task={task}
      />
    </>
  );
};
