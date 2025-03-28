import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Task } from "./types/task";
import { TaskForm } from "./TaskForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProjectMember } from "./types/projectMember";

interface EditTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  projectStages: { id: string; name: string }[];
  projectMembers: ProjectMember[];
  onTaskUpdated: () => void;
}

export const EditTaskDialog = ({
  open,
  onOpenChange,
  task,
  projectStages,
  projectMembers,
  onTaskUpdated
}: EditTaskDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdateTask = async (formData: {
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
    if (!task) return;
    
    setIsSubmitting(true);
    try {
      console.log("Updating task with data:", formData);
      
      // Prepare update data
      const updateData = {
        title: formData.title,
        description: formData.description,
        due_date: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        priority: formData.priority,
        // For general tasks, set stage_id to null instead of empty string
        stage_id: task.is_general ? null : (formData.stageId || null),
        assigned_to: formData.assignedTo,
        category: task.is_general ? formData.category : undefined,
        requires_deliverable: formData.requiresDeliverable
      };
      
      console.log("Final update data being sent to database:", updateData);
      
      // Update task in database
      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', task.id);
        
      if (error) throw error;
      
      // Upload templates if provided
      if (formData.templates && formData.templates.length > 0) {
        for (const file of formData.templates) {
          const fileName = `${Date.now()}-${file.name}`;
          const filePath = `task-templates/${task.id}/${fileName}`;
          
          // Upload file to storage
          const { error: uploadError } = await supabase.storage
            .from('templates')
            .upload(filePath, file);
          
          if (uploadError) {
            console.error("Error uploading template:", uploadError);
            continue;
          }
          
          // Get public URL
          const { data: publicURL } = supabase.storage
            .from('templates')
            .getPublicUrl(filePath);
          
          // Create template record
          const { error: templateError } = await supabase
            .from('task_templates')
            .insert({
              task_id: task.id,
              file_url: publicURL.publicUrl,
              file_name: fileName,
              file_type: file.type,
              created_by: (await supabase.auth.getUser()).data.user?.id
            });
          
          if (templateError) {
            console.error("Error creating template record:", templateError);
          }
        }
      }
      
      toast.success("تم تحديث المهمة بنجاح");
      onTaskUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("حدث خطأ أثناء تحديث المهمة");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>تعديل المهمة</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <TaskForm
            onSubmit={handleUpdateTask}
            isSubmitting={isSubmitting}
            projectStages={projectStages}
            projectMembers={projectMembers}
            isGeneral={!!task.is_general}
            initialValues={{
              title: task.title,
              description: task.description || "",
              dueDate: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : "",
              priority: task.priority || "medium",
              stageId: task.stage_id || "",
              assignedTo: task.assigned_to || null,
              category: task.category || "غير محدد",
              requiresDeliverable: task.requires_deliverable || false
            }}
            isEditMode={true}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
