
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TaskForm } from "./TaskForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { ProjectMember } from "./types/projectMember";

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectStages: { id: string; name: string }[];
  onTaskAdded: () => void;
  projectMembers: ProjectMember[];
  isGeneral?: boolean;
  isWorkspace?: boolean;
}

export const AddTaskDialog = ({
  open,
  onOpenChange,
  projectId,
  projectStages,
  onTaskAdded,
  projectMembers,
  isGeneral = false,
  isWorkspace = false
}: AddTaskDialogProps) => {
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
        // For general tasks, set is_general to true and stage_id to null
        is_general: isGeneral,
        // For workspace tasks, set workspace_id
        workspace_id: isWorkspace ? projectId : null,
        // For project tasks, set project_id and stage_id
        project_id: isGeneral || isWorkspace ? null : projectId,
        stage_id: isGeneral || isWorkspace ? null : formData.stageId,
        // Set category for general tasks
        category: isGeneral ? formData.category : null,
        requires_deliverable: formData.requiresDeliverable || false
      };
      
      console.log("Inserting task with data:", taskData);
      
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
      onTaskAdded();
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding task:", error);
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
            {isGeneral ? "إضافة مهمة عامة" : isWorkspace ? "إضافة مهمة مساحة العمل" : "إضافة مهمة للمشروع"}
          </DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <TaskForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            projectStages={projectStages}
            projectMembers={projectMembers}
            isGeneral={isGeneral}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
