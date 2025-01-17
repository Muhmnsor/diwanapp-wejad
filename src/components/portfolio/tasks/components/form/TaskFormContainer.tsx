import { useState } from "react";
import { TaskForm } from "./TaskForm";
import { submitTask } from "../../utils/taskSubmission";

interface TaskFormContainerProps {
  workspaceId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const TaskFormContainer = ({ 
  workspaceId,
  onSuccess,
  onCancel 
}: TaskFormContainerProps) => {
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
    } catch (error) {
      console.error('Error in handleSubmit:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <TaskForm
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      onCancel={onCancel}
      workspaceId={workspaceId}
    />
  );
};