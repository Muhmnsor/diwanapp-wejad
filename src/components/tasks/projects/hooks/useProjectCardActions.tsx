
import { useNavigate } from "react-router-dom";

export const useProjectCardActions = () => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent, projectId: string) => {
    // Check if click is inside a dialog or form element 
    if ((e.target as HTMLElement).closest('.project-actions') || 
        (e.target as HTMLElement).closest('[role="dialog"]') ||
        (e.target as HTMLElement).closest('form')) {
      e.stopPropagation();
      return;
    }
    navigate(`/tasks/project/${projectId}`);
  };

  const handleEditClick = (e: React.MouseEvent, setIsEditDialogOpen: (open: boolean) => void) => {
    e.stopPropagation();
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, setIsDeleteDialogOpen: (open: boolean) => void) => {
    e.stopPropagation();
    setIsDeleteDialogOpen(true);
  };

  const handleCopyClick = (e: React.MouseEvent, setIsCopyDialogOpen: (open: boolean) => void) => {
    e.stopPropagation();
    setIsCopyDialogOpen(true);
  };

  return {
    handleClick,
    handleEditClick,
    handleDeleteClick,
    handleCopyClick
  };
};
