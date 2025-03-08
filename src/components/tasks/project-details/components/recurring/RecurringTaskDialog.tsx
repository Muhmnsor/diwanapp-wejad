// Import statements should include ProjectMember from types instead of hooks
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { TaskForm } from "../TaskForm";
import { RecurringTaskFormFields } from "./RecurringTaskFormFields";
import { TaskFormActions } from "../TaskFormActions";
import { ProjectMember } from "../../types/projectMember";

interface RecurringTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectStages: { id: string; name: string }[];
  projectMembers: ProjectMember[];
  onTaskAdded: () => void;
}

export const RecurringTaskDialog = ({
  open,
  onOpenChange,
  projectId,
  projectStages,
  projectMembers,
  onTaskAdded,
}: RecurringTaskDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recurringSettings, setRecurringSettings] = useState({
    frequency: "daily",
    interval: 1,
    startDate: new Date(),
    endDate: null,
  });

  const handleSubmit = async (formData: {
    title: string;
    description: string;
    dueDate: string;
    priority: string;
    stageId: string;
    assignedTo: string | null;
    templates?: File[] | null;
    category?: string;
    requiresDeliverable?: boolean;
  }) => {
    setIsSubmitting(true);
    try {
      // TODO: Implement recurring task creation logic here
      console.log("Creating recurring task with data:", formData, recurringSettings);
      // After successful task creation
      onTaskAdded();
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating recurring task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>إنشاء مهمة متكررة</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <TaskForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            projectStages={projectStages}
            projectMembers={projectMembers}
            initialValues={{
              title: "",
              description: "",
              dueDate: "",
              priority: "medium",
              stageId: projectStages.length > 0 ? projectStages[0].id : "",
              assignedTo: projectMembers.length > 0 ? projectMembers[0].user_id : null,
            }}
          />
          <RecurringTaskFormFields
            recurringSettings={recurringSettings}
            setRecurringSettings={setRecurringSettings}
          />
          <TaskFormActions
            isSubmitting={isSubmitting}
            onCancel={() => onOpenChange(false)}
            submitLabel="إنشاء مهمة متكررة"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
