
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useProjectMembers, ProjectMember } from "../../project-details/hooks/useProjectMembers";
import { TaskForm } from "../../project-details/TaskForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WorkspaceAddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  onTaskAdded: () => void;
  projectMembers: ProjectMember[];
}

export const WorkspaceAddTaskDialog = ({
  open,
  onOpenChange,
  workspaceId,
  onTaskAdded,
  projectMembers
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
    if (!workspaceId) {
      toast.error("معرف مساحة العمل غير صالح");
      return;
    }

    setIsSubmitting(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      // Create task
      const { data: newTask, error } = await supabase
        .from('tasks')
        .insert({
          title: formData.title,
          description: formData.description,
          due_date: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
          priority: formData.priority,
          assigned_to: formData.assignedTo,
          workspace_id: workspaceId,
          created_by: user?.id,
          is_general: false,
          category: formData.category,
          requires_deliverable: formData.requiresDeliverable
        })
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      // Upload and attach templates if any
      if (formData.templates && formData.templates.length > 0 && newTask) {
        for (const file of formData.templates) {
          try {
            // File upload logic can be implemented here
            // Similar to what's in TaskForm component
          } catch (templateError) {
            console.error("Error with template:", templateError);
          }
        }
      }
      
      toast.success("تمت إضافة المهمة بنجاح");
      onTaskAdded();
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("حدث خطأ أثناء إنشاء المهمة");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Empty stages array since workspace tasks don't use stages
  const emptyStages: { id: string; name: string }[] = [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>إضافة مهمة جديدة</DialogTitle>
        </DialogHeader>
        
        <TaskForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          projectStages={emptyStages}
          projectMembers={projectMembers}
          isGeneral={true} // Use category field like general tasks
        />
      </DialogContent>
    </Dialog>
  );
};
