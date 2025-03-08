
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TaskForm } from "../project-details/TaskForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { ProjectMember } from "../project-details/types/projectMember";

interface WorkspaceAddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  onTaskAdded: () => Promise<void>;
  workspaceMembers: ProjectMember[];
}

export const WorkspaceAddTaskDialog = ({
  open,
  onOpenChange,
  workspaceId,
  onTaskAdded,
  workspaceMembers
}: WorkspaceAddTaskDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
      // Generate a unique task ID
      const taskId = uuidv4();
      
      // Prepare task data
      const taskData = {
        id: taskId,
        title: formData.title,
        description: formData.description,
        status: 'pending',
        priority: formData.priority,
        due_date: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        assigned_to: formData.assignedTo,
        created_at: new Date().toISOString(),
        workspace_id: workspaceId,
        is_general: false,
        project_id: null,
        stage_id: null,
        category: formData.category,
        requires_deliverable: formData.requiresDeliverable || false
      };
      
      console.log("Inserting workspace task with data:", taskData);
      
      // Insert task into database
      const { error } = await supabase
        .from('tasks')
        .insert([taskData]);
        
      if (error) throw error;
      
      // Upload templates if provided
      if (formData.templates && formData.templates.length > 0) {
        for (const file of formData.templates) {
          const fileName = `${Date.now()}-${file.name}`;
          const filePath = `task-templates/${taskId}/${fileName}`;
          
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
              task_id: taskId,
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
      
      toast.success("تمت إضافة المهمة بنجاح");
      await onTaskAdded();
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding workspace task:", error);
      toast.error("حدث خطأ أثناء إضافة المهمة");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            إضافة مهمة لمساحة العمل
          </DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <TaskForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            projectStages={[]}
            projectMembers={workspaceMembers}
            isGeneral={false}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
