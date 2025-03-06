
import { Dialog } from "@/components/ui/dialog";
import { useDeleteTaskProject } from "./hooks/useDeleteTaskProject";
import { DeleteTaskProjectDialogContent } from "./dialogs/DeleteTaskProjectDialogContent";

interface DeleteTaskProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle: string;
  onSuccess?: () => void;
  isDraft?: boolean;
}

export const DeleteTaskProjectDialog = ({
  isOpen,
  onClose,
  projectId,
  projectTitle,
  onSuccess,
  isDraft = false,
}: DeleteTaskProjectDialogProps) => {
  const { isDeleting, handleDelete } = useDeleteTaskProject({
    projectId,
    isDraft,
    onSuccess,
    onClose
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DeleteTaskProjectDialogContent
        projectTitle={projectTitle}
        isDraft={isDraft}
        isDeleting={isDeleting}
        onClose={onClose}
        onDelete={handleDelete}
      />
    </Dialog>
  );
};
