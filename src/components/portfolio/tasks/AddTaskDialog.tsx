import { Dialog, DialogContent } from "@/components/ui/dialog";
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
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold">إضافة مهمة جديدة</h2>
            <p className="text-sm text-gray-500">أدخل تفاصيل المهمة</p>
          </div>

          <TaskForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            onCancel={() => onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};