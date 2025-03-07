import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { TaskForm } from "./TaskForm";
import { useState } from "react";
import { uploadAttachment, saveTaskTemplate } from "../services/uploadService";
import { useProjectMembers, ProjectMember } from "./hooks/useProjectMembers";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useTaskAssignmentNotifications } from "@/hooks/useTaskAssignmentNotifications";
import { TaskDependency } from "./components/TaskDependenciesField";
import { DependencyType } from "./hooks/useTaskDependencies";

export const AddTaskDialog = ({ 
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
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { sendTaskAssignmentNotification } = useTaskAssignmentNotifications();

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);
    
    try {
      const { dependencies, ...taskData } = formData;
      
      const { data: newTask, error } = await supabase
        .from('tasks')
        .insert({
          title: taskData.title,
          description: taskData.description,
          assigned_to: taskData.assignedTo,
          due_date: taskData.dueDate ? new Date(taskData.dueDate).toISOString() : null,
          stage_id: !isGeneral ? taskData.stageId : null,
          priority: taskData.priority,
          status: 'pending',
          category: taskData.category || null,
          is_general: isGeneral || false,
          created_by: user?.id,
          project_id: projectId || null,
          workspace_id: isGeneral ? null : workspaceId,
        })
        .select()
        .single();
        
      if (error) throw error;
      
      if (dependencies && dependencies.length > 0) {
        const dependencyRecords = dependencies.map((dep: { taskId: string; dependencyType: DependencyType }) => ({
          task_id: newTask.id,
          dependency_task_id: dep.taskId,
          dependency_type: dep.dependencyType
        }));
        
        const { error: depError } = await supabase
          .from('task_dependencies')
          .insert(dependencyRecords);
          
        if (depError) {
          console.error("Error adding dependencies:", depError);
        }
      }

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

      if (formData.assignedTo) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
            const { data: creatorProfile } = await supabase
              .from('profiles')
              .select('display_name, email')
              .eq('id', user.id)
              .single();
              
            const creatorName = creatorProfile?.display_name || creatorProfile?.email || user.email || 'مستخدم';
            
            await sendTaskAssignmentNotification({
              taskId: newTask.id,
              taskTitle: formData.title,
              projectId: isGeneral ? null : projectId,
              projectTitle: isGeneral ? 'المهام العامة' : projectTitle,
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

      let templateErrors = false;
      if (formData.templates && formData.templates.length > 0 && newTask) {
        for (const file of formData.templates) {
          try {
            console.log("Processing template file:", file.name);
            
            const uploadResult = await uploadAttachment(file, 'template');
            
            if (uploadResult?.url) {
              console.log("Template uploaded successfully:", uploadResult.url);
              
              try {
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
            projectId={projectId}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
