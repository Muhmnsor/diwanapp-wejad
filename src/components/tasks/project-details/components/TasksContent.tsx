
import React from "react";
import { Task } from "../types/task";
import { StageType } from "../types/stage";
import { Skeleton } from "@/components/ui/skeleton";
import { ProjectTaskItem } from "./ProjectTaskItem";
import { StageTasks } from "./StageTasks";

interface TasksContentProps {
  isLoading: boolean;
  activeTab: string;
  filteredTasks: Task[];
  projectStages: StageType[];
  tasksByStage: { [key: string]: Task[] };
  getStatusBadge: (status: string) => React.ReactElement;
  getPriorityBadge: (priority: string | null) => React.ReactElement | null;
  formatDate: (date: string | null) => string;
  onStatusChange: (taskId: string, status: string) => Promise<void>;
  projectId?: string;
  isGeneral?: boolean;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => Promise<void>;
  customRenderTaskActions?: (task: Task) => React.ReactNode;
}

export const TasksContent = ({ 
  isLoading,
  activeTab,
  filteredTasks,
  projectStages,
  tasksByStage,
  getStatusBadge,
  getPriorityBadge,
  formatDate,
  onStatusChange,
  projectId,
  isGeneral,
  onEditTask,
  onDeleteTask,
  customRenderTaskActions
}: TasksContentProps) => {
  // Loading state
  if (isLoading) {
    return (
      <div className="mt-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-md" />
        ))}
      </div>
    );
  }

  // Empty state
  if (filteredTasks.length === 0) {
    return (
      <div className="mt-8 text-center">
        <p className="text-muted-foreground">لا توجد مهام {activeTab !== "all" ? `بحالة ${activeTab}` : ""}</p>
      </div>
    );
  }

  // If we have stages and we're not filtering by status, show tasks by stage
  const showByStages = projectStages.length > 0 && activeTab === "all" && !isGeneral;

  return (
    <div className="mt-4 space-y-4">
      {showByStages ? (
        // Tasks grouped by stage
        projectStages.map((stage) => (
          <StageTasks
            key={stage.id}
            stage={stage}
            tasks={tasksByStage[stage.id] || []}
            getStatusBadge={getStatusBadge}
            getPriorityBadge={getPriorityBadge}
            formatDate={formatDate}
            onStatusChange={onStatusChange}
            projectId={projectId}
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTask}
            customRenderTaskActions={customRenderTaskActions}
          />
        ))
      ) : (
        // Simple task list
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <ProjectTaskItem
              key={task.id}
              task={task}
              getStatusBadge={getStatusBadge}
              getPriorityBadge={getPriorityBadge}
              formatDate={formatDate}
              onStatusChange={onStatusChange}
              projectId={projectId}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
              customRenderTaskActions={customRenderTaskActions}
            />
          ))}
        </div>
      )}
    </div>
  );
};
