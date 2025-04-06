
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
  hideTasksHeader?: boolean;
  hideTasksTitle?: boolean;
  isWorkspace?: boolean;
}

export type { Task };

export const ProjectTasksList = ({ 
  projectId,
  projectMembers: externalProjectMembers,
  stages: externalStages,
  tasks: externalTasks,
  onTaskAdded,
  onTaskUpdated,
  meetingId,
  isGeneral = false,
  hideTasksHeader = false,
  hideTasksTitle = false,
  isWorkspace = false
}: ProjectTasksListProps) => {
  // Fix: Only pass necessary parameters and handle others within the component
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
  } = useTasksList(
    projectId, 
    meetingId,
    isWorkspace
  );
  
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { projectMembers: fetchedMembers } = useProjectMembers(
    externalProjectMembers ? undefined : projectId
  );
  
  const tasks = externalTasks || fetchedTasks;
  
  const projectMembers = externalProjectMembers || fetchedMembers;

  const stages = externalStages || projectStages;

  const isGeneralBoolean = Boolean(isGeneral);

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
      {!isGeneralBoolean && !meetingId && (
        <ProjectStages 
          projectId={projectId} 
          onStagesChange={handleStagesChange} 
        />
      )}
      
      <Card className="border shadow-sm" dir="rtl">
        <CardHeader className="pb-0">
          <TasksHeader 
            onAddTask={() => setIsAddDialogOpen(true)} 
            isGeneral={isGeneralBoolean}
            hideAddButton={hideTasksHeader}
            hideTitle={hideTasksTitle}
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
            projectStages={stages}
            tasksByStage={tasksByStage}
            getStatusBadge={getStatusBadge}
            getPriorityBadge={getPriorityBadge}
            formatDate={formatDate}
            onStatusChange={handleStatusChange}
            projectId={projectId}
            isGeneral={isGeneralBoolean}
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
        isGeneral={isGeneralBoolean}
        meetingId={meetingId}
        isWorkspace={isWorkspace}
      />

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
