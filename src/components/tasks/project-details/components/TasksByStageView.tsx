
import { Task } from "../types/task";
import { TasksStageGroup } from "./TasksStageGroup";

interface TasksByStageViewProps {
  projectStages: any[];
  tasksByStage: Record<string, Task[]>;
  onStatusChange: (taskId: string, newStatus: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TasksByStageView = ({
  projectStages,
  tasksByStage,
  onStatusChange,
  onEditTask,
  onDeleteTask
}: TasksByStageViewProps) => {
  return (
    <div className="mt-6 space-y-6">
      {projectStages.map(stage => (
        <TasksStageGroup
          key={stage.id}
          stage={stage}
          tasks={tasksByStage[stage.id] || []}
          onStatusChange={onStatusChange}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
        />
      ))}
    </div>
  );
};
