
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { uploadAttachment, saveTaskTemplate, saveAttachmentReference } from "../../services/uploadService";

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
  meetingId
}: UseTaskFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id;

      // For meeting tasks, use specific categories
      let taskType = null;
      if (meetingId) {
        taskType = 'meeting_task';
      } else if (isGeneral) {
        taskType = 'general_task';
      }

      const taskData = {
        title: formData.title,
        description: formData.description || "",
        due_date: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        priority: formData.priority,
        assigned_to: formData.assignedTo,
        project_id: isGeneral ? null : projectId,
        stage_id: isGeneral ? null : formData.stageId,
        is_general: isGeneral && !meetingId, // It's a general task if isGeneral is true and meetingId is not provided
        category: isGeneral || meetingId ? formData.category : null,
        workspace_id: null, // Will be set based on project or general workspace
        created_by: userId,
        requires_deliverable: formData.requiresDeliverable || false,
        meeting_id: meetingId || null, // Add the meeting_id field
        task_type: taskType // Identify tasks created from meetings with the specific type
      };

      console.log("Task data to insert:", taskData);

      let result;
      
      if (taskId) {
        // Update existing task
        const { data, error } = await supabase
          .from("tasks")
          .update(taskData)
          .eq("id", taskId)
          .select()
          .single();
        
        if (error) throw error;
        result = data;
        
        toast.success("تم تحديث المهمة بنجاح");
        
        if (onTaskUpdated) onTaskUpdated();
      } else {
        // Create new task
        const { data, error } = await supabase
          .from("tasks")
          .insert(taskData)
          .select()
          .single();
        
        if (error) throw error;
        result = data;
        
        toast.success("تمت إضافة المهمة بنجاح");
        
        // Upload templates if provided
        if (formData.templates && formData.templates.length > 0 && result) {
          for (const file of formData.templates) {
            const { url, error } = await uploadAttachment(file, "template");
            
            if (error || !url) {
              console.error("Error uploading template:", error);
              continue;
            }
            
            // Save template reference
            await saveTaskTemplate(
              result.id,
              url,
              file.name,
              file.type
            );
          }
        }
        
        if (onTaskAdded) onTaskAdded();
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
    handleSubmit
  };
};
