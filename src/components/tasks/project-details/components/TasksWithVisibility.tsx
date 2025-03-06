
import { useEffect } from "react";
import { Task } from "../types/task";
import { TasksTableLayout } from "./TasksTableLayout";
import { TasksListLayout } from "./TasksListLayout";
import { useDraftTasksVisibility } from "@/hooks/useDraftTasksVisibility";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface TasksWithVisibilityProps {
  tasks: Task[];
  viewMode: "table" | "list";
  getStatusBadge: (status: string) => JSX.Element;
  getPriorityBadge: (priority: string | null) => JSX.Element | null;
  formatDate: (date: string | null) => string;
  onStatusChange: (taskId: string, newStatus: string) => void;
  projectId?: string;
  isDraftProject?: boolean;
}

export const TasksWithVisibility = ({
  tasks,
  viewMode,
  getStatusBadge,
  getPriorityBadge,
  formatDate,
  onStatusChange,
  projectId,
  isDraftProject
}: TasksWithVisibilityProps) => {
  // Use our custom hook to handle task visibility
  const { visibleTasks, isProjectManager, isDraftProject: isDraftFromHook } = useDraftTasksVisibility(
    tasks,
    projectId
  );

  // Determine if the project is in draft mode from props or hook
  const isInDraftMode = isDraftProject || isDraftFromHook;

  // If in draft mode and not a project manager, show a message
  if (isInDraftMode && !isProjectManager && tasks.length > 0) {
    return (
      <Alert variant="warning" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>مشروع قيد الإعداد</AlertTitle>
        <AlertDescription>
          هذا المشروع لا يزال في مرحلة المسودة. ستتمكن من رؤية المهام عند إطلاق المشروع.
        </AlertDescription>
      </Alert>
    );
  }

  // No tasks to display
  if (visibleTasks.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg border">
        <h3 className="text-lg font-medium text-gray-500">لا توجد مهام</h3>
        <p className="text-sm text-gray-400 mt-2">
          {isInDraftMode
            ? "قم بإضافة مهام جديدة للمشروع"
            : "لا توجد مهام متاحة حالياً"}
        </p>
      </div>
    );
  }

  // Render the appropriate layout based on view mode
  return viewMode === "table" ? (
    <TasksTableLayout
      tasks={visibleTasks}
      getStatusBadge={getStatusBadge}
      getPriorityBadge={getPriorityBadge}
      formatDate={formatDate}
      onStatusChange={onStatusChange}
      projectId={projectId || ""}
    />
  ) : (
    <TasksListLayout
      tasks={visibleTasks}
      getStatusBadge={getStatusBadge}
      getPriorityBadge={getPriorityBadge}
      formatDate={formatDate}
      onStatusChange={onStatusChange}
      projectId={projectId || ""}
    />
  );
};
