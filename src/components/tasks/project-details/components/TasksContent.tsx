
import { useState } from "react";
import { Task } from "../types/task";
import { ProjectStagesTasks } from "./ProjectStagesTasks";
import { TasksWithVisibility } from "./TasksWithVisibility";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List } from "lucide-react";

interface TasksContentProps {
  isLoading: boolean;
  activeTab: string;
  filteredTasks: Task[];
  projectStages: any[];
  tasksByStage: Record<string, Task[]>;
  getStatusBadge: (status: string) => JSX.Element;
  getPriorityBadge: (priority: string | null) => JSX.Element | null;
  formatDate: (date: string | null) => string;
  onStatusChange: (taskId: string, newStatus: string) => void;
  projectId?: string;
  isGeneral: boolean;
  isDraftProject?: boolean;
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
  isDraftProject
}: TasksContentProps) => {
  const [viewMode, setViewMode] = useState<"table" | "list">("table");

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">جاري تحميل المهام...</p>
      </div>
    );
  }

  if (activeTab === "stages" && !isGeneral && projectStages.length > 0) {
    return (
      <ProjectStagesTasks
        projectStages={projectStages}
        tasksByStage={tasksByStage}
        getStatusBadge={getStatusBadge}
        getPriorityBadge={getPriorityBadge}
        formatDate={formatDate}
        onStatusChange={onStatusChange}
        projectId={projectId}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-2">
        <div className="flex space-x-2 rtl:space-x-reverse">
          <Button
            variant={viewMode === "table" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("table")}
            className="h-8 px-2"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="h-8 px-2"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <TasksWithVisibility
        tasks={filteredTasks}
        viewMode={viewMode}
        getStatusBadge={getStatusBadge}
        getPriorityBadge={getPriorityBadge}
        formatDate={formatDate}
        onStatusChange={onStatusChange}
        projectId={projectId}
        isDraftProject={isDraftProject}
      />
    </div>
  );
};
