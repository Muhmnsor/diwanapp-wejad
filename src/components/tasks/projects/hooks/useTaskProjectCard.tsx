
import { useFetchProjectTasks } from "./useFetchProjectTasks";
import { useProjectOwner } from "./useProjectOwner";
import { useProjectDialogs } from "./useProjectDialogs";
import { useProjectCardActions } from "./useProjectCardActions";
import { useProjectStatusUpdater } from "./useProjectStatusUpdater";

interface TaskProject {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: string;
  workspace_id: string;
  project_id: string | null;
  project_manager?: string | null;
  project_manager_name?: string | null;
}

export const useTaskProjectCard = (project: TaskProject, onProjectUpdated?: () => void) => {
  // Fetch tasks data
  const {
    completedTasksCount,
    totalTasksCount,
    overdueTasksCount,
    completionPercentage,
    isLoading
  } = useFetchProjectTasks(project.id);

  // Get project owner
  const { projectOwner } = useProjectOwner(project);

  // Manage dialogs
  const {
    isEditDialogOpen,
    isDeleteDialogOpen,
    isCopyDialogOpen,
    setIsEditDialogOpen,
    setIsDeleteDialogOpen,
    setIsCopyDialogOpen,
    handleProjectUpdated,
    handleProjectDeleted,
    handleProjectCopied
  } = useProjectDialogs(onProjectUpdated);

  // Project card click handlers
  const { handleClick, handleEditClick, handleDeleteClick, handleCopyClick } = useProjectCardActions();

  // Update project status if needed
  useProjectStatusUpdater({
    projectId: project.id,
    currentStatus: project.status,
    completionPercentage,
    totalTasksCount
  });

  // Create wrapped handler functions that include required parameters
  const wrapHandleClick = (e: React.MouseEvent) => handleClick(e, project.id);
  const wrapHandleEditClick = (e: React.MouseEvent) => handleEditClick(e, setIsEditDialogOpen);
  const wrapHandleDeleteClick = (e: React.MouseEvent) => handleDeleteClick(e, setIsDeleteDialogOpen);
  const wrapHandleCopyClick = (e: React.MouseEvent) => handleCopyClick(e, setIsCopyDialogOpen);

  return {
    completedTasksCount,
    totalTasksCount,
    overdueTasksCount,
    isLoading,
    completionPercentage,
    projectOwner,
    isEditDialogOpen,
    isDeleteDialogOpen,
    isCopyDialogOpen,
    handleClick: wrapHandleClick,
    handleEditClick: wrapHandleEditClick,
    handleDeleteClick: wrapHandleDeleteClick,
    handleCopyClick: wrapHandleCopyClick,
    handleProjectUpdated,
    handleProjectDeleted,
    handleProjectCopied,
    setIsEditDialogOpen,
    setIsDeleteDialogOpen,
    setIsCopyDialogOpen
  };
};
