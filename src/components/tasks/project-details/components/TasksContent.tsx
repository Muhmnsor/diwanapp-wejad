
import { Task } from "../types/task";
import { TaskItem } from "./TaskItem";
import { TasksByStageView } from "./TasksByStageView";

interface TasksContentProps {
  isLoading: boolean;
  activeTab: string;
  filteredTasks: Task[];
  projectStages: any[];
  tasksByStage: Record<string, Task[]>;
  getStatusBadge: (status: string) => JSX.Element;
  getPriorityBadge: (priority: string) => JSX.Element;
  formatDate: (date: string) => string;
  onStatusChange: (taskId: string, newStatus: string) => void;
  projectId?: string;
  isGeneral: boolean;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TasksContent = ({
  isLoading,
  activeTab,
  filteredTasks,
  projectStages,
  tasksByStage,
  onStatusChange,
  projectId,
  isGeneral,
  onEditTask,
  onDeleteTask
}: TasksContentProps) => {
  if (isLoading) {
    return (
      <div className="py-10 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isGeneral && projectStages.length > 0 && activeTab === "all") {
    return (
      <TasksByStageView
        projectStages={projectStages}
        tasksByStage={tasksByStage}
        onStatusChange={onStatusChange}
        onEditTask={onEditTask}
        onDeleteTask={onDeleteTask}
      />
    );
  }

  return (
    <div className="mt-6">
      {filteredTasks.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          لا توجد مهام لعرضها
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onStatusChange={onStatusChange}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
            />
          ))}
        </div>
      )}
    </div>
  );
};
