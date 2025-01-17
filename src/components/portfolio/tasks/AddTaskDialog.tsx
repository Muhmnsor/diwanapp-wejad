import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { TaskFormContainer } from "./components/form/TaskFormContainer";

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  onSuccess: () => void;
}

export const AddTaskDialog = ({ 
  open, 
  onOpenChange,
  workspaceId,
  onSuccess 
}: AddTaskDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]" dir="rtl">
        <DialogTitle>إضافة مهمة جديدة</DialogTitle>
        <div className="space-y-6">
          <p className="text-sm text-gray-500">أدخل تفاصيل المهمة</p>

          <TaskFormContainer
            workspaceId={workspaceId}
            onSuccess={onSuccess}
            onCancel={() => onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};