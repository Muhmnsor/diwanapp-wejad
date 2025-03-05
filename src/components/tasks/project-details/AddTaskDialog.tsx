
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { TaskForm } from "./TaskForm";
import { useState } from "react";
import { uploadAttachment, saveAttachmentReference } from "../services/uploadService";
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
  const [attachment, setAttachment] = useState<File[] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: {
    title: string;
    description: string;
    dueDate: string;
    priority: string;
    stageId: string;
    assignedTo: string | null;
    attachment?: File[] | null;
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

      // معالجة المرفقات إذا وجدت
      let attachmentErrors = false;
      if (formData.attachment && formData.attachment.length > 0 && taskData) {
        for (const file of formData.attachment) {
          try {
            const fileCategory = (file as any).category || 'creator';
            console.log("Processing attachment with category:", fileCategory);
            
            const uploadResult = await uploadAttachment(file, fileCategory);
            
            if (uploadResult?.url) {
              console.log("Attachment uploaded successfully:", uploadResult.url);
              
              try {
                // حفظ معلومات المرفق في قاعدة البيانات
                await saveAttachmentReference(
                  taskData.id,
                  uploadResult.url,
                  file.name,
                  file.type,
                  fileCategory
                );
                console.log("Attachment reference saved successfully");
              } catch (refError) {
                console.error("Error saving attachment reference:", refError);
                attachmentErrors = true;
              }
            } else {
              console.error("Upload result error:", uploadResult?.error);
              attachmentErrors = true;
            }
          } catch (uploadError) {
            console.error("Error handling attachment:", uploadError);
            attachmentErrors = true;
          }
        }
      }

      if (attachmentErrors) {
        toast.warning("تم إنشاء المهمة ولكن قد تكون بعض المرفقات لم تُرفع بشكل صحيح");
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
            attachment={attachment}
            setAttachment={setAttachment}
            projectMembers={projectMembers}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
