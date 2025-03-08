import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { uploadAttachment, saveTaskTemplate } from "@/components/tasks/services/uploadService";

export const useTaskForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (
    projectId: string,
    workspaceId: string,
    formData: {
      title: string;
      description: string;
      dueDate: string;
      priority: string;
      stageId: string;
      assignedTo: string | null;
      templates?: File[] | null;
      category?: string;
      requiresDeliverable?: boolean;
    },
    onTaskAdded: () => void
  ) => {
    setIsSubmitting(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      // Create task
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          project_id: projectId,
          workspace_id: workspaceId,
          title: formData.title,
          description: formData.description,
          due_date: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
          priority: formData.priority,
          stage_id: formData.stageId,
          assigned_to: formData.assignedTo,
          created_by: user?.id,
          category: formData.category,
          requires_deliverable: formData.requiresDeliverable
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      const newTaskId = data.id;

      if (formData.templates && formData.templates.length > 0) {
        for (const file of formData.templates) {
          try {
            console.log("Uploading template:", file.name);
            const uploadResult = await uploadAttachment(file, 'template');
            
            if (uploadResult.error) {
              toast.error(`فشل في رفع القالب ${file.name}: ${uploadResult.error}`);
              continue;
            }
            
            // Save reference to the task_templates table
            await saveTaskTemplate(
              newTaskId,
              uploadResult.url,
              file.name,
              file.type
            );
          } catch (templateError) {
            console.error("Error uploading template:", templateError);
            // Continue with next template
          }
        }
      }

      toast.success("تمت إضافة المهمة بنجاح");
      onTaskAdded();
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("حدث خطأ أثناء إنشاء المهمة");
    } finally {
      setIsSubmitting(false);
    }
  };

  return { onSubmit, isSubmitting };
};
