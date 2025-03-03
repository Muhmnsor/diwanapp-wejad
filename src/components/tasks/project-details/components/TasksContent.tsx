
import { Skeleton } from "@/components/ui/skeleton";
import { Task } from "../TasksList";
import { TasksStageGroup } from "./TasksStageGroup";
import { TaskCard } from "./TaskCard";

interface TasksContentProps {
  isLoading: boolean;
  activeTab: string;
  filteredTasks: Task[];
  projectStages: { id: string; name: string }[];
  tasksByStage: Record<string, Task[]>;
  getStatusBadge: (status: string) => JSX.Element;
  getPriorityBadge: (priority: string | null) => JSX.Element | null;
  formatDate: (date: string | null) => string;
}

export const TasksContent = ({
  isLoading,
  activeTab,
  filteredTasks,
  projectStages,
  tasksByStage,
  getStatusBadge,
  getPriorityBadge,
  formatDate
}: TasksContentProps) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, index) => (
          <Skeleton key={index} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (filteredTasks.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-md border">
        <p className="text-gray-500">لا توجد مهام {activeTab !== "all" && "بهذه الحالة"}</p>
      </div>
    );
  }

  if (projectStages.length > 0) {
    return (
      <div className="space-y-6">
        {projectStages.map(stage => (
          <TasksStageGroup
            key={stage.id}
            stage={stage}
            tasks={tasksByStage[stage.id] || []}
            activeTab={activeTab}
            getStatusBadge={getStatusBadge}
            getPriorityBadge={getPriorityBadge}
            formatDate={formatDate}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {filteredTasks.map(task => (
        <TaskCard
          key={task.id}
          task={task}
          getStatusBadge={getStatusBadge}
          getPriorityBadge={getPriorityBadge}
          formatDate={formatDate}
        />
      ))}
    </div>
  );
};
