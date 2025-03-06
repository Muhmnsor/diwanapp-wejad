
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { TaskForm } from "./TaskForm";
import { useState } from "react";
import { uploadAttachment, saveTaskTemplate } from "../services/uploadService";
import { useProjectMembers, ProjectMember } from "./hooks/useProjectMembers";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function AddTaskDialog({ 
  open, 
  onOpenChange, 
  projectId, 
  projectStages, 
  onTaskAdded, 
  projectMembers 
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectStages: { id: string; name: string }[];
  onTaskAdded: () => void;
  projectMembers: ProjectMember[];
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: {
    title: string;
    description: string;
    dueDate: string;
    priority: string;
    stageId: string;
    assignedTo: string | null;
    templates?: File[] | null;
  }) => {
    setIsSubmitting(true);
    
    try {
      console.log("Submitting task data:", formData);
      
      // إنشاء المهمة أولاً
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .insert({
          project_id: projectId,
          title: formData.title,
          description: formData.description,
          assigned_to: formData.assignedTo,
          due_date: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
          stage_id: formData.stageId,
          priority: formData.priority,
          status: 'pending'
        })
        .select()
        .single();

      if (taskError) {
        console.error("Error creating task:", taskError);
        toast.error("فشل في إنشاء المهمة");
        return;
      }

      console.log("Task created successfully:", taskData);

      // معالجة النماذج إذا وجدت
      let templateErrors = false;
      if (formData.templates && formData.templates.length > 0 && taskData) {
        for (const file of formData.templates) {
          try {
            console.log("Processing template file:", file.name);
            
            const uploadResult = await uploadAttachment(file, 'template');
            
            if (uploadResult?.url) {
              console.log("Template uploaded successfully:", uploadResult.url);
              
              try {
                // حفظ النموذج في جدول نماذج المهمة
                await saveTaskTemplate(
                  taskData.id,
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
          <DialogTitle>إضافة مهمة جديدة</DialogTitle>
          <DialogDescription>
            أضف مهمة جديدة إلى المشروع. اضغط إرسال عند الانتهاء.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-auto">
          <TaskForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            projectStages={projectStages}
            projectMembers={projectMembers}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
