
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ProjectStages } from "./ProjectStages";
import { AddTaskDialog } from "./AddTaskDialog";
import { TasksHeader } from "./components/TasksHeader";
import { TasksFilter } from "./components/TasksFilter";
import { TasksContent } from "./components/TasksContent";
import { getStatusBadge, getPriorityBadge, formatDate } from "./utils/taskFormatters";
import { useTasksList } from "./hooks/useTasksList";
import { Task } from "./types/task";
import { ProjectMember } from "./types/projectMember";
import { useProjectMembers } from "./hooks/useProjectMembers";
import { EditTaskDialog } from "./EditTaskDialog";

interface ProjectTasksListProps {
  projectId?: string | undefined;
  projectMembers?: ProjectMember[];
  stages?: { id: string; name: string }[];
  tasks?: Task[];
  onTaskAdded?: () => void;
  onTaskUpdated?: () => void;
  meetingId?: string;
  isGeneral?: boolean;
}

// Re-export Task interface for backward compatibility
export type { Task };

export const ProjectTasksList = ({ 
  projectId,
  projectMembers: externalProjectMembers,
  stages: externalStages,
  tasks: externalTasks,
  onTaskAdded,
  onTaskUpdated,
  meetingId,
  isGeneral = false
}: ProjectTasksListProps) => {
  const {
    tasks: fetchedTasks,
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
    deleteTask
  } = useTasksList(projectId, meetingId);
  
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Use external project members if provided, otherwise fetch them
  const { projectMembers: fetchedMembers } = useProjectMembers(
    externalProjectMembers ? undefined : projectId
  );
  
  // Use external tasks if provided, otherwise use fetched tasks
  const tasks = externalTasks || fetchedTasks;
  
  // Use either external members or fetched members
  const projectMembers = externalProjectMembers || fetchedMembers;

  // Use external stages if provided, otherwise use the ones from useTasksList
  const stages = externalStages || projectStages;

  // Refetch tasks when external inputs change
  useEffect(() => {
    if (!externalTasks) {
      fetchTasks();
    }
  }, [projectId, meetingId]);

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
      if (onTaskUpdated) onTaskUpdated();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  return (
    <>
      {!isGeneral && !meetingId && (
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
            projectStages={stages}
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
      
      <AddTaskDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        projectId={projectId || ""}
        projectStages={stages}
        onTaskAdded={() => {
          fetchTasks();
          if (onTaskAdded) onTaskAdded();
        }}
        projectMembers={projectMembers}
        isGeneral={isGeneral}
        meetingId={meetingId}
      />

      {/* Dialog for editing tasks */}
      {editingTask && (
        <EditTaskDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          task={editingTask}
          projectStages={stages}
          projectMembers={projectMembers}
          onTaskUpdated={() => {
            fetchTasks();
            if (onTaskUpdated) onTaskUpdated();
          }}
          meetingId={meetingId}
        />
      )}
    </>
  );
};
