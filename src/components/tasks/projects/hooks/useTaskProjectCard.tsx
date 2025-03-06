
import { useProjectTasksStats } from "./project-card/useProjectTasksStats";
import { useProjectOwner } from "./project-card/useProjectOwner";
import { useProjectDialogs } from "./project-card/useProjectDialogs";
import { useProjectNavigation } from "./project-card/useProjectNavigation";
import { useProjectActions } from "./project-card/useProjectActions";

interface TaskProject {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: string;
  workspace_id: string;
  project_id: string | null;
  manager_name: string | null;
}

export const useTaskProjectCard = (project: TaskProject, onProjectUpdated?: () => void) => {
  // Use our decomposed hooks
  const { 
    completedTasksCount, 
    totalTasksCount,
    overdueTasksCount,
    completionPercentage,
    isLoading
  } = useProjectTasksStats(project.id, project.status);
  
  const { projectOwner } = useProjectOwner(project.id, project.manager_name);
  
  const {
    isEditDialogOpen,
    isDeleteDialogOpen,
    setIsEditDialogOpen,
    setIsDeleteDialogOpen,
    handleEditClick,
    handleDeleteClick
  } = useProjectDialogs();
  
  const { handleClick } = useProjectNavigation(project.id);
  
  const { handleProjectUpdated, handleProjectDeleted } = useProjectActions(onProjectUpdated);

  return {
    completedTasksCount,
    totalTasksCount,
    overdueTasksCount,
    isLoading,
    completionPercentage,
    projectOwner,
    isEditDialogOpen,
    isDeleteDialogOpen,
    handleClick,
    handleEditClick,
    handleDeleteClick,
    handleProjectUpdated,
    handleProjectDeleted,
    setIsEditDialogOpen,
    setIsDeleteDialogOpen
  };
};
