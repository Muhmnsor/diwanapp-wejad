
import { useDeleteMeetingFolder } from "@/hooks/meetings/useDeleteMeetingFolder";
import { toast } from "sonner";
import { DeleteDialog } from "@/components/ui/delete-dialog";

interface DeleteFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folderId: string;
  onSuccess?: () => void;
}

export const DeleteFolderDialog = ({
  open,
  onOpenChange,
  folderId,
  onSuccess,
}: DeleteFolderDialogProps) => {
  const { mutate: deleteFolder, isPending } = useDeleteMeetingFolder();

  const handleDelete = () => {
    deleteFolder(folderId, {
      onSuccess: () => {
        onOpenChange(false);
        if (onSuccess) onSuccess();
      },
      onError: (error) => {
        toast.error(`حدث خطأ أثناء حذف التصنيف: ${error.message}`);
      }
    });
  };

  return (
    <DeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      title="حذف التصنيف"
      description="هل أنت متأكد من رغبتك في حذف هذا التصنيف؟ ستبقى الاجتماعات المرتبطة به ولكن سيتم إزالة ارتباطها بهذا التصنيف."
      onDelete={handleDelete}
      isDeleting={isPending}
    />
  );
};
