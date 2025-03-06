
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Task } from "../types/task";
import { TasksSkeleton } from "./TasksSkeleton";
import { TaskStageTabs } from "./TaskStageTabs";
import { TasksListLayout } from "./TasksListLayout";
import { TasksTableLayout } from "./TasksTableLayout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LayoutGrid, LayoutList } from "lucide-react";

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
  isGeneral?: boolean;
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
  isGeneral = false,
  isDraftProject = false,
}: TasksContentProps) => {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const handleViewChange = (mode: "list" | "grid") => {
    setViewMode(mode);
  };

  if (isLoading) {
    return <TasksSkeleton />;
  }

  if (filteredTasks.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border">
        <h3 className="text-lg font-medium text-gray-500">لا توجد مهام</h3>
        <p className="text-sm text-gray-400 mt-2">
          {isDraftProject 
            ? "المشروع في وضع المسودة. أضف المهام وعندما تنتهي اضغط على زر 'إطلاق المشروع' ليتم إرسال المهام للمكلفين" 
            : "قم بإضافة مهمة جديدة للبدء"}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="mb-4 flex justify-end">
        <div className="flex gap-2 border rounded-md p-1">
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => handleViewChange("list")}
          >
            <LayoutList className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => handleViewChange("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all-tasks" className="mt-4">
        <TaskStageTabs
          projectStages={projectStages}
          tasksCount={filteredTasks.length}
          tasksByStage={tasksByStage}
          isGeneral={isGeneral}
        />

        <TabsContent value="all-tasks" className="mt-4">
          {viewMode === "list" ? (
            <TasksTableLayout
              tasks={filteredTasks}
              getStatusBadge={getStatusBadge}
              getPriorityBadge={getPriorityBadge}
              formatDate={formatDate}
              onStatusChange={onStatusChange}
              projectId={projectId || ""}
            />
          ) : (
            <TasksListLayout
              tasks={filteredTasks}
              getStatusBadge={getStatusBadge}
              getPriorityBadge={getPriorityBadge}
              formatDate={formatDate}
              onStatusChange={onStatusChange}
              projectId={projectId || ""}
            />
          )}
        </TabsContent>

        {projectStages.map((stage) => (
          <TabsContent key={stage.id} value={`stage-${stage.id}`} className="mt-4">
            {viewMode === "list" ? (
              <TasksTableLayout
                tasks={tasksByStage[stage.id] || []}
                getStatusBadge={getStatusBadge}
                getPriorityBadge={getPriorityBadge}
                formatDate={formatDate}
                onStatusChange={onStatusChange}
                projectId={projectId || ""}
              />
            ) : (
              <TasksListLayout
                tasks={tasksByStage[stage.id] || []}
                getStatusBadge={getStatusBadge}
                getPriorityBadge={getPriorityBadge}
                formatDate={formatDate}
                onStatusChange={onStatusChange}
                projectId={projectId || ""}
              />
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
