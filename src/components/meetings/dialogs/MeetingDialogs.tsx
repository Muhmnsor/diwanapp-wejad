
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Meeting } from "@/types/meeting";
import { Loader2 } from "lucide-react";
import { useDeleteMeeting } from "@/hooks/meetings/useDeleteMeeting";
import { toast } from "sonner";

// Delete Meeting Dialog
interface DeleteMeetingDialogProps {
  meetingId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const DeleteMeetingDialog: React.FC<DeleteMeetingDialogProps> = ({
  meetingId,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const { mutateAsync: deleteMeeting, isPending } = useDeleteMeeting();

  const handleDelete = async () => {
    try {
      await deleteMeeting(meetingId);
      toast.success("تم حذف الاجتماع بنجاح");
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error("حدث خطأ أثناء حذف الاجتماع");
      console.error("Error deleting meeting:", error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-right">هل أنت متأكد من حذف هذا الاجتماع؟</AlertDialogTitle>
          <AlertDialogDescription className="text-right">
            سيتم حذف الاجتماع وجميع المهام والمحاضر المرتبطة به بشكل نهائي. لا يمكن التراجع عن هذا الإجراء.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-row-reverse justify-start gap-2">
          <AlertDialogCancel>إلغاء</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
            حذف الاجتماع
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// Edit Meeting Dialog (Stub)
interface EditMeetingDialogProps {
  meeting: Meeting;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const EditMeetingDialog: React.FC<EditMeetingDialogProps> = ({
  meeting,
  open,
  onOpenChange,
  onSuccess,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">تعديل الاجتماع</DialogTitle>
          <DialogDescription className="text-right">
            قم بتعديل تفاصيل الاجتماع أدناه
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 text-right">
          تنفيذ وظيفة تعديل الاجتماع قيد التطوير.
        </div>
        <DialogFooter className="flex flex-row-reverse justify-start gap-2">
          <Button
            onClick={() => onOpenChange(false)}
          >
            إغلاق
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Add Participant Dialog
interface AddParticipantDialogProps {
  meetingId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddParticipantDialog: React.FC<AddParticipantDialogProps> = ({
  meetingId,
  open,
  onOpenChange,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">إدارة المشاركين</DialogTitle>
          <DialogDescription className="text-right">
            قم بإضافة أو إزالة المشاركين في هذا الاجتماع
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 text-right">
          تنفيذ وظيفة إدارة المشاركين قيد التطوير.
        </div>
        <DialogFooter className="flex flex-row-reverse justify-start gap-2">
          <Button
            onClick={() => onOpenChange(false)}
          >
            إغلاق
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
