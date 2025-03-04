
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { TaskForm } from "./TaskForm";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { uploadAttachment } from "../services/uploadService";
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
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("normal");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [stageId, setStageId] = useState(projectStages[0]?.id || "");
  const [assignedTo, setAssignedTo] = useState(projectMembers[0]?.id || "");
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
      
      // رفع المرفقات إذا وجدت
      const attachmentUrls: string[] = [];
      if (formData.attachment && formData.attachment.length > 0) {
        for (const file of formData.attachment) {
          console.log("Uploading attachment:", file);
          try {
            const uploadResult = await uploadAttachment(file);
            if (uploadResult?.url) {
              attachmentUrls.push(uploadResult.url);
              console.log("Upload successful:", uploadResult.url);
            }
          } catch (uploadError) {
            console.error("Error uploading file:", uploadError);
            toast.error("حدث خطأ أثناء رفع الملف");
          }
        }
      }

      // إنشاء المهمة في قاعدة البيانات - نحذف حقل priority لأنه غير موجود في الجدول
      const { data: taskData, error: taskError } = await supabase
        .from('project_tasks')
        .insert({
          project_id: projectId,
          title: formData.title,
          description: formData.description,
          assigned_to: formData.assignedTo,
          due_date: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
          stage_id: formData.stageId,
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

      // إضافة المرفقات للمهمة إذا وجدت
      if (attachmentUrls.length > 0 && taskData) {
        for (const fileUrl of attachmentUrls) {
          const { error: attachmentError } = await supabase
            .from('task_attachments')
            .insert({
              task_id: taskData.id,
              file_url: fileUrl,
              file_name: fileUrl.split('/').pop() || 'attachment',
              created_by: await supabase.auth.getUser().then(res => res.data.user?.id)
            });

          if (attachmentError) {
            console.error("Error saving attachment reference:", attachmentError);
          }
        }
      }

      toast.success("تم إضافة المهمة بنجاح");
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
