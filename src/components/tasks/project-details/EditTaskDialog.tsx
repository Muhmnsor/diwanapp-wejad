
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TaskForm } from "./TaskForm";
import { Task } from "./types/task";
import { ProjectMember } from "./types/projectMember";
import { useTaskForm } from "./hooks/useTaskForm";

interface EditTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
  projectStages: { id: string; name: string }[];
  projectMembers: ProjectMember[];
  onTaskUpdated: () => void;
  meetingId?: string;
}

export const EditTaskDialog = ({
  open,
  onOpenChange,
  task,
  projectStages,
  projectMembers,
  onTaskUpdated,
  meetingId
}: EditTaskDialogProps) => {
  // Format the due date to a string that the form expects
  const formatDateForInput = (dueDateString: string | null) => {
    if (!dueDateString) return "";
    const date = new Date(dueDateString);
    return date.toISOString().split('T')[0]; // Format as "YYYY-MM-DD"
  };

  const initialValues = {
    title: task.title || "",
    description: task.description || "",
    dueDate: task.due_date ? formatDateForInput(task.due_date) : "",
    priority: task.priority || "medium",
    stageId: task.stage_id || "",
    assignedTo: task.assigned_to,
    category: task.category || "إدارية",
    requiresDeliverable: task.requires_deliverable || false
  };

  const { isSubmitting, error, handleSubmit } = useTaskForm({
    projectId: task.project_id || undefined,
    isGeneral: task.is_general || false,
    onTaskUpdated,
    initialValues,
    taskId: task.id,
    meetingId
  });

  const onSubmit = async (formData: {
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
    await handleSubmit(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>تعديل المهمة</DialogTitle>
        </DialogHeader>
        <TaskForm
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          projectStages={projectStages}
          projectMembers={projectMembers}
          isGeneral={task.is_general || !!meetingId}
          initialValues={initialValues}
          isEditMode={true}
        />
      </DialogContent>
    </Dialog>
  );
};
