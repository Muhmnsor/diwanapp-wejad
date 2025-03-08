import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { TaskForm } from "@/components/tasks/project-details/TaskForm";
import { useState } from "react";
import { uploadAttachment, saveTaskTemplate } from "@/components/tasks/project-details/services/uploadService";
import { ProjectMember } from "../../project-details/types/projectMember";
import { useProjectMembers } from "../../project-details/hooks/useProjectMembers";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useTaskAssignmentNotifications } from "@/hooks/useTaskAssignmentNotifications";

interface WorkspaceAddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  onTaskAdded: () => void;
}

export function WorkspaceAddTaskDialog({
  open,
  onOpenChange,
  workspaceId,
  onTaskAdded,
}: WorkspaceAddTaskDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { projectMembers } = useProjectMembers();
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

    try {
      console.log("Submitting task data:", formData);

      // Create the task first
      const taskData: any = {
        title: formData.title,
        description: formData.description,
        assigned_to: formData.assignedTo,
        due_date: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        priority: formData.priority,
        status: 'pending',
        workspace_id: workspaceId,
        category: formData.category || null,
        requires_deliverable: formData.requiresDeliverable || false
      };

      const { data: newTask, error: taskError } = await supabase
        .from('tasks')
        .insert(taskData)
        .select()
        .single();

      if (taskError) {
        console.error("Error creating task:", taskError);
        toast.error("Failed to create task");
        return;
      }

      console.log("Task created successfully:", newTask);

      // Send notification if task is assigned to someone
      if (formData.assignedTo) {
        try {
          // Get current user info
          const { data: { user } } = await supabase.auth.getUser();

          if (user) {
            // Get user's display name or email
            const { data: creatorProfile } = await supabase
              .from('profiles')
              .select('display_name, email')
              .eq('id', user.id)
              .single();

            const creatorName = creatorProfile?.display_name || creatorProfile?.email || user.email || 'مستخدم';

            // Send the notification
            await sendTaskAssignmentNotification({
              taskId: newTask.id,
              taskTitle: formData.title,
              projectId: null, // No project ID for workspace tasks
              projectTitle: 'مهام مساحة العمل',
              assignedUserId: formData.assignedTo,
              assignedByUserId: user.id,
              assignedByUserName: creatorName
            });

            console.log('Task assignment notification sent to:', formData.assignedTo);
          }
        } catch (notifyError) {
          console.error('Error sending task assignment notification:', notifyError);
        }
      }

      // Process templates if they exist
      let templateErrors = false;
      if (formData.templates && formData.templates.length > 0 && newTask) {
        for (const file of formData.templates) {
          try {
            console.log("Processing template file:", file.name);

            const uploadResult = await uploadAttachment(file, 'template');

            if (uploadResult?.url) {
              console.log("Template uploaded successfully:", uploadResult.url);

              try {
                // Save the template in the task_templates table
                await saveTaskTemplate(
                  newTask.id,
                  uploadResult.url,
                  file.name,
                  file.type
                );
                console.log("Task template saved successfully");
              } catch (refError) {
                console.error("Error saving template reference:", refError);
                templateErrors = true;
              }
            } else {
              console.error("Upload result error:", uploadResult?.error);
              templateErrors = true;
            }
          } catch (uploadError) {
            console.error("Error handling template file:", uploadError);
            templateErrors = true;
          }
        }
      }

      if (templateErrors) {
        toast.warning("Task created, but some templates may not have uploaded correctly");
      } else {
        toast.success("Task added successfully");
      }

      onTaskAdded();
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting task:", error);
      toast.error("An error occurred while saving the task");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col rtl">
        <DialogHeader>
          <DialogTitle>إضافة مهمة جديدة</DialogTitle>
          <DialogDescription>
            أضف مهمة جديدة إلى مساحة العمل. اضغط إرسال عند الانتهاء.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-auto">
          <TaskForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            projectStages={[]} // Empty for workspace tasks
            projectMembers={projectMembers}
            isGeneral={false}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
