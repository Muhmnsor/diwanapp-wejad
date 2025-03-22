
import { useDeleteMeetingFolder } from "@/hooks/meetings/useDeleteMeetingFolder";
import { toast } from "sonner";
import { DeleteDialog } from "@/components/ui/delete-dialog";

interface DeleteMeetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meetingId: string;
  onSuccess?: () => void;
}

export const DeleteMeetingDialog = ({
  open,
  onOpenChange,
  meetingId,
  onSuccess,
}: DeleteMeetingDialogProps) => {
  const { mutate: deleteMeeting, isPending } = useDeleteMeetingFolder();

  const handleDelete = () => {
    deleteMeeting(meetingId, {
      onSuccess: () => {
        onOpenChange(false);
        toast.success("تم حذف الاجتماع بنجاح");
        if (onSuccess) onSuccess();
      },
      onError: (error) => {
        toast.error(`حدث خطأ أثناء حذف الاجتماع: ${error.message}`);
      }
    });
  };

  return (
    <DeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      title="حذف الاجتماع"
      description="هل أنت متأكد من رغبتك في حذف هذا الاجتماع؟ لن تتمكن من استعادته بعد الحذف."
      onDelete={handleDelete}
      isDeleting={isPending}
    />
  );
};
