
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
  hideAddButton?: boolean;
  meetingId?: string;
  tasks?: Task[];
  isLoading?: boolean;
  error?: Error | null;
  onTasksChange?: () => void;
}

// Re-export Task interface for backward compatibility
export type { Task };

export const TasksList = ({ 
  projectId, 
  isWorkspace = false, 
  hideAddButton = false,
  meetingId,
  tasks: externalTasks,
  isLoading: externalLoading,
  error: externalError,
  onTasksChange
}: TasksListProps) => {
  const {
    tasks,
    isLoading,
    activeTab,
    setActiveTab,
    isAddDialogOpen,
    setIsAddDialogOpen,
    projectStages,
    handleStagesChange,
    tasksByStage,
    handleStatusChange,
    fetchTasks,
    isGeneral,
    deleteTask
  } = useTasksList(projectId, isWorkspace, externalTasks, externalLoading, externalError);

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

  const handleTaskDataChanged = () => {
    fetchTasks();
    // Also call the external onTasksChange handler if provided
    if (onTasksChange) {
      onTasksChange();
    }
  };

  return (
    <>
      {!isGeneral && !isWorkspace && (
        <ProjectStages 
          projectId={projectId} 
          onStagesChange={handleStagesChange} 
        />
      )}
      
      <Card className="border shadow-sm">
        <CardHeader className="pb-0">
          <TasksHeader 
            onAddTask={() => setIsAddDialogOpen(true)} 
            isGeneral={isGeneral}
            hideAddButton={hideAddButton}
          />
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
          />
        </CardContent>
      </Card>
      
      {!hideAddButton && (
        <AddTaskDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          projectId={projectId || ""}
          projectStages={projectStages}
          onTaskAdded={handleTaskDataChanged}
          projectMembers={projectMembers}
          isGeneral={isGeneral}
          isWorkspace={isWorkspace}
          meetingId={meetingId}
        />
      )}

      {/* Dialog for editing tasks */}
      {editingTask && (
        <EditTaskDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          task={editingTask}
          projectStages={projectStages}
          projectMembers={projectMembers}
          onTaskUpdated={handleTaskDataChanged}
        />
      )}
    </>
  );
};
