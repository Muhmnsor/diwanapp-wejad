import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { TaskForm } from "../../project-details/TaskForm";
import { useState } from "react";
import { uploadAttachment, saveTaskTemplate } from "../../services/uploadService";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTaskAssignmentNotifications } from "@/hooks/useTaskAssignmentNotifications";
import { ProjectMember } from "../../project-details/types/projectMember";
import { useProjectMembers } from "../../project-details/hooks/useProjectMembers";

export function WorkspaceAddTaskDialog({ 
  open, 
  onOpenChange, 
  workspaceId,
  onTaskAdded,
  projectMembers
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  onTaskAdded: () => void;
  projectMembers: ProjectMember[];
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      console.log("Submitting workspace task data:", formData);
      
      // Create the task
      const taskData: any = {
        title: formData.title,
        description: formData.description,
        assigned_to: formData.assignedTo,
        due_date: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        priority: formData.priority,
        status: 'pending',
        category: formData.category || null,
        is_general: true,
        requires_deliverable: formData.requiresDeliverable || false,
        workspace_id: workspaceId
      };
      
      const { data: newTask, error: taskError } = await supabase
        .from('tasks')
        .insert(taskData)
        .select()
        .single();

      if (taskError) {
        console.error("Error creating task:", taskError);
        toast.error("فشل في إنشاء المهمة");
        return;
      }

      console.log("Task created successfully:", newTask);

      // Get workspace details for the notification
      let workspaceName = '';
      const { data: workspaceData } = await supabase
        .from('workspaces')
        .select('name')
        .eq('id', workspaceId)
        .single();
      
      if (workspaceData) {
        workspaceName = workspaceData.name;
      }

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
              projectId: null,
              projectTitle: workspaceName || 'مساحة العمل',
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

      // Handle templates if there are any
      let templateErrors = false;
      if (formData.templates && formData.templates.length > 0 && newTask) {
        for (const file of formData.templates) {
          try {
            console.log("Processing template file:", file.name);
            
            const uploadResult = await uploadAttachment(file, 'template');
            
            if (uploadResult?.url) {
              console.log("Template uploaded successfully:", uploadResult.url);
              
              try {
                // Save the template in the task templates table
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
        toast.warning("تم إنشاء المهمة ولكن قد تكون بعض النماذج لم تُرفع بشكل صحيح");
      } else {
        toast.success("تم إضافة المهمة بنجاح");
      }
      
      onTaskAdded();
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting task:", error);
      toast.error("حدث خطأ أثناء حفظ المهمة");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col rtl">
        <DialogHeader>
          <DialogTitle>إضافة مهمة جديدة في مساحة العمل</DialogTitle>
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
            isGeneral={true}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
