
import { useState } from "react";

export const useProjectDialogs = () => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteDialogOpen(true);
  };

  return {
    isEditDialogOpen,
    isDeleteDialogOpen,
    setIsEditDialogOpen,
    setIsDeleteDialogOpen,
    handleEditClick,
    handleDeleteClick
  };
};
