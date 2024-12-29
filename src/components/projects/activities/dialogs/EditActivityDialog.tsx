import { Dialog, DialogContent } from "@/components/ui/dialog";
import { EditActivityForm } from "../form/EditActivityForm";
import { EditProjectActivityHeader } from "../EditProjectActivityHeader";
import { Activity } from "@/types/activity";

interface EditActivityDialogProps {
  isOpen: boolean;
  onClose: () => void;
  activity: Activity;
  onSave: (activity: Activity) => void;
}

export const EditActivityDialog = ({
  isOpen,
  onClose,
  activity,
  onSave,
}: EditActivityDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] space-y-4 text-right" dir="rtl" side="left">
        <EditProjectActivityHeader />
        <EditActivityForm
          activity={activity}
          onSave={onSave}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};