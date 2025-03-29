
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ProjectStages } from "../ProjectStages";
import { AddTaskDialog } from "../AddTaskDialog";
import { TasksHeader } from "../components/TasksHeader";
import { TasksFilter } from "../components/TasksFilter";
import { TasksContent } from "../components/TasksContent";
import { getStatusBadge, getPriorityBadge, formatDate } from "../utils/taskFormatters";
import { useTasksList } from "../hooks/useTasksList";
import { Task } from "../types/task";
import { ProjectMember } from "../types/projectMember";
import { useProjectMembers } from "../hooks/useProjectMembers";
import { useState } from "react";
import { EditTaskDialog } from "../EditTaskDialog";

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
  isGeneral: externalIsGeneral,
  hideTasksHeader,
  hideTasksTitle
}: ProjectTasksListProps) => {
  const {
    tasks: fetchedTasks,
    isLoading,
    activeTab,
    setActiveTab,
    isAddDialogOpen,
    setIsAddDialogOpen,
    projectStages: fetchedStages,
    handleStagesChange,
    tasksByStage,
    handleStatusChange,
    fetchTasks,
    isGeneral: calculatedIsGeneral,
    deleteTask
  } = useTasksList(projectId, meetingId);

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Use external project members if provided, otherwise fetch them
  const { projectMembers: fetchedMembers } = useProjectMembers(
    externalProjectMembers ? undefined : projectId
  );
  
  // Determine which data sources to use
  const tasks = externalTasks || fetchedTasks;
  const projectMembers = externalProjectMembers || fetchedMembers;
  const stages = externalStages || fetchedStages;
  const isGeneral = typeof externalIsGeneral !== 'undefined' ? externalIsGeneral : calculatedIsGeneral;

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
      {!isGeneral && !hideTasksHeader && (
        <ProjectStages 
          projectId={projectId} 
          onStagesChange={handleStagesChange} 
        />
      )}
      
      <Card className="border shadow-sm">
        {!hideTasksHeader && (
          <CardHeader className="pb-0">
            <TasksHeader 
              onAddTask={() => setIsAddDialogOpen(true)} 
              isGeneral={isGeneral} 
              hideTitle={hideTasksTitle}
            />
          </CardHeader>
        )}
        
        <CardContent className={hideTasksHeader ? "pt-2" : "pt-4"}>
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
