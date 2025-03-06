
import { toast } from "sonner";

export const useProjectActions = (onProjectUpdated?: () => void) => {
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

  return {
    handleProjectUpdated,
    handleProjectDeleted
  };
};
