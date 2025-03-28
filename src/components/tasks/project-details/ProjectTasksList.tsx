
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
}

// Re-export Task interface for backward compatibility
export type { Task };

export const ProjectTasksList = ({ 
  projectId,
  projectMembers: externalProjectMembers,
  stages: externalStages
}: ProjectTasksListProps) => {
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
  } = useTasksList(projectId);

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Use external project members if provided, otherwise fetch them
  const { projectMembers: fetchedMembers } = useProjectMembers(
    externalProjectMembers ? undefined : projectId
  );
  
  // Use either external members or fetched members
  const projectMembers = externalProjectMembers || fetchedMembers;

  // Use external stages if provided, otherwise use the ones from useTasksList
  const stages = externalStages || projectStages;

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
      {!isGeneral && (
        <ProjectStages 
          projectId={projectId} 
          onStagesChange={handleStagesChange} 
        />
      )}
      
      <Card className="border shadow-sm" dir="rtl">
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
        onTaskAdded={fetchTasks}
        projectMembers={projectMembers}
        isGeneral={isGeneral}
      />

      {/* Dialog for editing tasks */}
      {editingTask && (
        <EditTaskDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          task={editingTask}
          projectStages={stages}
          projectMembers={projectMembers}
          onTaskUpdated={fetchTasks}
        />
      )}
    </>
  );
};
