
import { Task } from "../types/task";
import { TaskCard } from "./TaskCard";

interface TasksStageGroupProps {
  stage: {
    id: string;
    name: string;
  };
  tasks: Task[];
  activeTab: string;
  getStatusBadge: (status: string) => JSX.Element;
  getPriorityBadge: (priority: string | null) => JSX.Element | null;
  formatDate: (date: string | null) => string;
  onStatusChange: (taskId: string, newStatus: string) => void;
  onDeleteTask?: (taskId: string) => void;
  projectId: string;
}

export const TasksStageGroup = ({
  stage,
  tasks,
  activeTab,
  getStatusBadge,
  getPriorityBadge,
  formatDate,
  onStatusChange,
  onDeleteTask,
  projectId
}: TasksStageGroupProps) => {
  // Filter tasks based on active tab
  const filteredTasks = activeTab === "all" 
    ? tasks 
    : tasks.filter(task => task.status === activeTab);

  if (filteredTasks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="bg-gray-50 p-3 rounded-lg border">
        <h3 className="font-medium text-gray-800">{stage.name}</h3>
      </div>
      <div className="grid gap-3">
        {filteredTasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            getStatusBadge={getStatusBadge}
            getPriorityBadge={getPriorityBadge}
            formatDate={formatDate}
            onStatusChange={onStatusChange}
            onDeleteTask={onDeleteTask}
            projectId={projectId}
          />
        ))}
      </div>
    </div>
  );
};
