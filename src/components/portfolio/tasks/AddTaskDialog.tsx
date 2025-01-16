import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { TaskForm } from "./components/TaskForm";
import { submitTask } from "./utils/taskSubmission";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: {
    title: string;
    description: string;
    dueDate: string;
    priority: string;
    assignedTo: string;
  }) => {
    setIsSubmitting(true);
    try {
      await submitTask({
        workspaceId,
        ...formData
      });
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]" dir="rtl">
        <DialogTitle>إضافة مهمة جديدة</DialogTitle>
        <div className="space-y-6">
          <p className="text-sm text-gray-500">أدخل تفاصيل المهمة</p>

          <TaskForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            onCancel={() => onOpenChange(false)}
            workspaceId={workspaceId}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};