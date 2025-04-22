// src/hooks/tasks/useTaskForm.tsx
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

import {
  uploadAttachment,
  saveTaskTemplate,
  saveAttachmentReference, // keep if you still need it somewhere else
} from "../../services/uploadService";

import { useTaskAssignmentNotifications } from "@/hooks/useTaskAssignmentNotifications";

export interface UseTaskFormProps {
  projectId?: string;
  isGeneral?: boolean;
  onTaskAdded?: () => void;
  onTaskUpdated?: () => void;
  initialValues?: {
    title: string;
    description: string;
    dueDate: string;
    priority: string;
    stageId: string;
    assignedTo: string | null;
    category?: string;
    requiresDeliverable?: boolean;
  };
  taskId?: string;
  meetingId?: string;
}

export const useTaskForm = ({
  projectId,
  isGeneral = false,
  onTaskAdded,
  onTaskUpdated,
  initialValues,
  taskId,
  meetingId,
}: UseTaskFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ⬇️  Import the notification‑sending hook
  const { sendTaskAssignmentNotification } = useTaskAssignmentNotifications();

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
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const userId = user?.id;

      const taskData = {
        title: formData.title,
        description: formData.description || "",
        due_date: formData.dueDate
          ? new Date(formData.dueDate).toISOString()
          : null,
        priority: formData.priority,
        assigned_to: formData.assignedTo,
        project_id: isGeneral ? null : projectId,
        stage_id: isGeneral ? null : formData.stageId,
        is_general: isGeneral && !meetingId,
        category: isGeneral || meetingId ? formData.category : null,
        workspace_id: null,
        created_by: userId,
        requires_deliverable: formData.requiresDeliverable || false,
        meeting_id: meetingId || null,
        task_type: meetingId ? "meeting_task" : null,
      };

      let result;

      if (taskId) {
        /* ---------- Update existing task ---------- */
        const { data, error } = await supabase
          .from("tasks")
          .update(taskData)
          .eq("id", taskId)
          .select()
          .single();

        if (error) throw error;
        result = data;

        toast.success("تم تحديث المهمة بنجاح");
        onTaskUpdated?.();
      } else {
        /* ---------- Create new task ---------- */
        const { data, error } = await supabase
          .from("tasks")
          .insert(taskData)
          .select()
          .single();

        if (error) throw error;
        result = data;

        /* 🔔 Send assignment notification */
        try {
          await sendTaskAssignmentNotification({
            taskId: result.id,
            taskTitle: formData.title,
            assignedUserId: formData.assignedTo ?? "",
            projectId: taskData.project_id ?? undefined,
            projectTitle: isGeneral ? null : undefined, // null for general tasks
            assignedByUserId: userId ?? undefined,
          });
        } catch (notificationError) {
          // Don’t block task creation if notification fails
          console.error(
            "Failed to send assignment notification:",
            notificationError
          );
        }

        /* ---------- Upload any template attachments ---------- */
        if (
          formData.templates &&
          formData.templates.length > 0 &&
          result?.id
        ) {
          for (const file of formData.templates) {
            const { url, error } = await uploadAttachment(file, "template");
            if (error || !url) {
              console.error("Error uploading template:", error);
              continue;
            }
            await saveTaskTemplate(result.id, url, file.name, file.type);
          }
        }

        toast.success("تمت إضافة المهمة بنجاح");
        onTaskAdded?.();
      }
    } catch (err: any) {
      console.error("Error submitting task:", err);
      setError(err.message || "حدث خطأ أثناء حفظ المهمة");
      toast.error("حدث خطأ أثناء حفظ المهمة");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    error,
    handleSubmit,
  };
};
