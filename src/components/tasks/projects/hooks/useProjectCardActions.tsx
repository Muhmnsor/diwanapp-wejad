
import { useNavigate } from "react-router-dom";

export const useProjectCardActions = () => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent, projectId: string) => {
    if ((e.target as HTMLElement).closest('.project-actions')) {
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
