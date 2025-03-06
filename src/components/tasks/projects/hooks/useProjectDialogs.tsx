
import { useState } from "react";
import { toast } from "sonner";

export const useProjectDialogs = (onProjectUpdated?: () => void) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);

  const handleProjectUpdated = () => {
    toast.success("تم تحديث المشروع بنجاح");
    if (onProjectUpdated) {
      onProjectUpdated();
    }
  };

  const handleProjectDeleted = () => {
    toast.success("تم حذف المشروع بنجاح");
    if (onProjectUpdated) {
      onProjectUpdated();
    }
  };

  const handleProjectCopied = () => {
    toast.success("تم نسخ المشروع بنجاح");
    if (onProjectUpdated) {
      onProjectUpdated();
    }
  };

  return {
    isEditDialogOpen,
    isDeleteDialogOpen,
    isCopyDialogOpen,
    setIsEditDialogOpen,
    setIsDeleteDialogOpen,
    setIsCopyDialogOpen,
    handleProjectUpdated,
    handleProjectDeleted,
    handleProjectCopied
  };
};
