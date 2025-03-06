
import { Task } from "../types/task";
import { TaskItem } from "./TaskItem";

interface TasksStageGroupProps {
  stage: any;
  tasks: Task[];
  onStatusChange: (taskId: string, newStatus: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TasksStageGroup = ({
  stage,
  tasks,
  onStatusChange,
  onEditTask,
  onDeleteTask
}: TasksStageGroupProps) => {
  if (tasks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h3 className="font-medium text-lg">{stage.name}</h3>
      <div className="space-y-2">
        {tasks.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            onStatusChange={onStatusChange}
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTask}
          />
        ))}
      </div>
    </div>
  );
};
