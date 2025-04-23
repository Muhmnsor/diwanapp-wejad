
import React, { useState } from "react";
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
import { DragDebugPanel } from "./components/debug/DragDebugPanel";

interface TasksListProps {
  projectId?: string | undefined;
  isWorkspace?: boolean;
  meetingId?: string;
}

// Re-export Task interface for backward compatibility
export type { Task };

export const TasksList = ({ 
  projectId, 
  isWorkspace = false,
  meetingId
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
  } = useTasksList(projectId, meetingId, isWorkspace);

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Debug state for drag operations
  const [debugInfo, setDebugInfo] = useState({
    activeTaskId: null,
    overTaskId: null,
    isDragging: false,
    currentStageId: null,
    targetStageId: null,
    reorderStatus: 'idle',
    lastError: null
  });

  // Fetch project members
  const { projectMembers } = useProjectMembers(projectId);

  // Convert isGeneral to boolean to ensure type safety
  const isGeneralBoolean = Boolean(isGeneral);

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

  // Debug handler for updating drag state
  const handleDragDebugUpdate = (debugData) => {
    setDebugInfo(prevState => ({
      ...prevState,
      ...debugData
    }));
  };

  return (
    <>
      {!isGeneralBoolean && !isWorkspace && !meetingId && (
        <ProjectStages 
          projectId={projectId} 
          onStagesChange={handleStagesChange} 
        />
      )}
      
      <Card className="border shadow-sm">
        <CardHeader className="pb-0">
          <TasksHeader 
            onAddTask={() => setIsAddDialogOpen(true)} 
            isGeneral={isGeneralBoolean}
            projectId={projectId || ''} 
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
            isGeneral={isGeneralBoolean}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onDragDebugUpdate={handleDragDebugUpdate}
          />
        </CardContent>
      </Card>
      
      <AddTaskDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        projectId={projectId || ""}
        projectStages={projectStages}
        onTaskAdded={fetchTasks}
        projectMembers={projectMembers}
        isGeneral={isGeneralBoolean}
        isWorkspace={isWorkspace}
        meetingId={meetingId}
      />

      {/* Dialog for editing tasks */}
      {editingTask && (
        <EditTaskDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          task={editingTask}
          projectStages={projectStages}
          projectMembers={projectMembers}
          onTaskUpdated={fetchTasks}
          meetingId={meetingId}
        />
      )}
      
      {/* Debug Panel */}
      <DragDebugPanel debugInfo={debugInfo} />
    </>
  );
};
