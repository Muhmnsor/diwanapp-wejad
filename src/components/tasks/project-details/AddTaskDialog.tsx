
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { TaskForm } from "./TaskForm";
import { useState } from "react";
import { uploadAttachment, saveTaskTemplate } from "../services/uploadService";
import { useProjectMembers, ProjectMember } from "./hooks/useProjectMembers";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useTaskAssignmentNotifications } from "@/hooks/useTaskAssignmentNotifications";
import { useAuthStore } from "@/store/authStore";

export function AddTaskDialog({ 
  open, 
  onOpenChange, 
  projectId, 
  projectStages, 
  onTaskAdded, 
  projectMembers,
  isGeneral
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectStages: { id: string; name: string }[];
  onTaskAdded: () => void;
  projectMembers: ProjectMember[];
  isGeneral?: boolean;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { sendTaskAssignmentNotification } = useTaskAssignmentNotifications();
  const { user } = useAuthStore();

  const handleSubmit = async (formData: {
    title: string;
    description: string;
    dueDate: string;
    priority: string;
    stageId: string;
    assignedTo: string | null;
    templates?: File[] | null;
    category?: string;
  }) => {
    setIsSubmitting(true);
    
    try {
      console.log("Submitting task data:", formData);
      
      // إنشاء المهمة أولاً
      const taskData: any = {
        title: formData.title,
        description: formData.description,
        assigned_to: formData.assignedTo,
        due_date: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        stage_id: !isGeneral ? formData.stageId : null,
        priority: formData.priority,
        status: 'pending',
        category: formData.category || null,
        is_general: isGeneral || false,
        created_by: user?.id  // Add the creator ID
      };
      
      if (!isGeneral) {
        taskData['project_id'] = projectId;
      }
      
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

      // Get project details for the notification (if applicable)
      let projectTitle = '';
      if (projectId && !isGeneral) {
        const { data: projectData } = await supabase
          .from('projects')
          .select('name')
          .eq('id', projectId)
          .single();
        
        if (projectData) {
          projectTitle = projectData.name;
        }
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
              assigneeId: formData.assignedTo,
              projectId: isGeneral ? null : projectId,
              projectTitle: isGeneral ? 'المهام العامة' : projectTitle,
              assignedByUserId: user.id,
              assignedByUserName: creatorName
            });
            
            console.log('Task assignment notification sent to:', formData.assignedTo);
          }
        } catch (notifyError) {
          console.error('Error sending task assignment notification:', notifyError);
        }
      }

      // معالجة النماذج إذا وجدت
      let templateErrors = false;
      if (formData.templates && formData.templates.length > 0 && newTask) {
        for (const file of formData.templates) {
          try {
            console.log("Processing template file:", file.name);
            
            const uploadResult = await uploadAttachment(file, 'template');
            
            if (uploadResult?.url) {
              console.log("Template uploaded successfully:", uploadResult.url);
              
              try {
                // حفظ النموذج في جدول نماذج المهمة
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
          <DialogTitle>إضافة {isGeneral ? "مهمة عامة" : "مهمة"} جديدة</DialogTitle>
          <DialogDescription>
            أضف {isGeneral ? "مهمة عامة" : "مهمة جديدة إلى المشروع"}. اضغط إرسال عند الانتهاء.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-auto">
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
