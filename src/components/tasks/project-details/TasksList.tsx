
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ProjectStages } from "./ProjectStages";
import { AddTaskDialog } from "./AddTaskDialog";
import { TasksHeader } from "./components/TasksHeader";
import { TasksFilter } from "./components/TasksFilter";
import { TasksContent } from "./components/TasksContent";
import { getStatusBadge, getPriorityBadge, formatDate } from "./utils/taskFormatters";
import { useTasksList } from "./hooks/useTasksList";
import { Task } from "./types/task";
import { useProjectMembers } from "./hooks/useProjectMembers";
import { useState } from "react";
import { EditTaskDialog } from "./EditTaskDialog";

interface TasksListProps {
  projectId?: string | undefined;
  isWorkspace?: boolean;
  // New props for customization
  customTasks?: Task[];
  customLoading?: boolean;
  customError?: any;
  customRefetch?: () => void;
  customRenderTaskActions?: (task: Task) => React.ReactNode;
  onCustomStatusChange?: (taskId: string, status: string) => Promise<void>;
}

// Re-export Task interface for backward compatibility
export type { Task };

export const TasksList = ({ 
  projectId, 
  isWorkspace = false,
  customTasks,
  customLoading,
  customError,
  customRefetch,
  customRenderTaskActions,
  onCustomStatusChange
}: TasksListProps) => {
  const {
    tasks: fetchedTasks,
    isLoading: fetchedLoading,
    activeTab,
    setActiveTab,
    isAddDialogOpen,
    setIsAddDialogOpen,
    projectStages,
    handleStagesChange,
    tasksByStage,
    handleStatusChange: defaultHandleStatusChange,
    fetchTasks,
    isGeneral,
    deleteTask
  } = useTasksList(projectId, isWorkspace);

  // Use custom values if provided, otherwise use the fetched ones
  const tasks = customTasks || fetchedTasks;
  const isLoading = customLoading !== undefined ? customLoading : fetchedLoading;
  const error = customError;
  const refetch = customRefetch || fetchTasks;

  // Status change handler - use custom handler if provided
  const handleStatusChange = async (taskId: string, status: string) => {
    if (onCustomStatusChange) {
      return onCustomStatusChange(taskId, status);
    }
    return defaultHandleStatusChange(taskId, status);
  };

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Fetch project members
  const { projectMembers } = useProjectMembers(projectId);

  const filteredTasks = tasks.filter(task => {
    if (activeTab === "all") return true;
    return task.status === activeTab;
  });

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsEditDialogOpen(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  return (
    <>
      {!isGeneral && !isWorkspace && !customTasks && (
        <ProjectStages 
          projectId={projectId} 
          onStagesChange={handleStagesChange} 
        />
      )}
      
      <Card className="border shadow-sm">
        <CardHeader className="pb-0">
          <TasksHeader onAddTask={() => setIsAddDialogOpen(true)} isGeneral={isGeneral} />
        </CardHeader>
        
        <CardContent className="pt-4">
          <TasksFilter 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
          />
          
          <TasksContent 
            isLoading={isLoading}
            activeTab={activeTab}
            filteredTasks={filteredTasks}
            projectStages={projectStages}
            tasksByStage={tasksByStage}
            getStatusBadge={getStatusBadge}
            getPriorityBadge={getPriorityBadge}
            formatDate={formatDate}
            onStatusChange={handleStatusChange}
            projectId={projectId}
            isGeneral={isGeneral}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            customRenderTaskActions={customRenderTaskActions}
          />
        </CardContent>
      </Card>
      
      {!customTasks && (
        <AddTaskDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          projectId={projectId || ""}
          projectStages={projectStages}
          onTaskAdded={fetchTasks}
          projectMembers={projectMembers}
          isGeneral={isGeneral}
          isWorkspace={isWorkspace}
        />
      )}

      {/* Dialog for editing tasks */}
      {editingTask && !customTasks && (
        <EditTaskDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          task={editingTask}
          projectStages={projectStages}
          projectMembers={projectMembers}
          onTaskUpdated={fetchTasks}
        />
      )}
    </>
  );
};
