
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TaskForm } from "./TaskForm";
import { Task } from "./types/task";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTaskForm } from "./hooks/useTaskForm";
import { ProjectMember } from "./types/projectMember";

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
  // تحويل التاريخ إلى الصيغة المطلوبة لحقل التاريخ (YYYY-MM-DD)
  const formatDateForInput = (dateString: string | null) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch (e) {
      return '';
    }
  };

  // تحضير القيم الأولية من المهمة المحددة
  const initialValues = {
    title: task.title,
    description: task.description || '',
    dueDate: formatDateForInput(task.due_date),
    priority: task.priority || 'medium',
    stageId: task.stage_id || projectStages[0]?.id || '',
    assignedTo: task.assigned_to,
    category: task.category || (task.meeting_id ? 'تحضيرية' : 'إدارية'),
    requiresDeliverable: task.requires_deliverable || false
  };

  const { isSubmitting, error, handleSubmit } = useTaskForm({
    projectId: task.project_id || undefined,
    isGeneral: task.is_general || !!meetingId,
    onTaskUpdated,
    initialValues,
    taskId: task.id,
    meetingId
  });

  const onSubmit = async (formData: any) => {
    await handleSubmit(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {meetingId ? "تعديل مهمة اجتماع" : task.is_general ? "تعديل مهمة عامة" : "تعديل مهمة المشروع"}
          </DialogTitle>
        </DialogHeader>
        <TaskForm
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          projectStages={projectStages}
          projectMembers={projectMembers}
          isGeneral={task.is_general || !!meetingId}
          initialValues={initialValues}
          isEditMode={true}
          meetingId={meetingId || task.meeting_id}
        />
      </DialogContent>
    </Dialog>
  );
};
