
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { TaskAttachmentField } from "../project-details/components/TaskAttachmentField";
import { useTask } from "../hooks/useTask";
import { useAttachmentOperations } from "../hooks/useAttachmentOperations";
import { toast } from "sonner";

export const TaskPage = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const { user } = useAuthStore();
  const { task, isLoading, refetchTask } = useTask(taskId);
  const [assigneeAttachment, setAssigneeAttachment] = useState<File[] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { uploadAttachment } = useAttachmentOperations(() => {
    refetchTask();
    setAssigneeAttachment(null);
  });

  const handleSubmitDeliverable = async () => {
    if (!taskId || !assigneeAttachment || assigneeAttachment.length === 0) return;
    
    setIsSubmitting(true);
    try {
      // التحقق من أن المستخدم هو المكلف بالمهمة
      if (task?.assigned_to !== user?.id) {
        toast.error("فقط المستخدم المكلف بالمهمة يمكنه رفع المستلمات");
        return;
      }
      
      for (const file of assigneeAttachment) {
        // تحديد تصنيف المرفق كمستلم من المكلف بالمهمة
        await uploadAttachment(file, taskId, 'assignee');
      }
      
      toast.success("تم رفع المستلمات بنجاح");
      setAssigneeAttachment(null);
    } catch (error) {
      console.error("Error uploading deliverable:", error);
      toast.error("حدث خطأ أثناء رفع المستلمات");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div>جاري التحميل...</div>;
  }

  // التحقق مما إذا كان المستخدم هو المكلف بالمهمة
  const isAssignee = task?.assigned_to === user?.id;

  return (
    <div className="space-y-6">
      {/* معلومات المهمة هنا */}
      
      {/* قسم رفع المستلمات (للمكلف بالمهمة فقط) */}
      {isAssignee && (
        <div className="border rounded-md p-4 mt-6">
          <h3 className="text-lg font-medium mb-4">رفع المستلمات</h3>
          <div className="space-y-4">
            <TaskAttachmentField
              attachment={assigneeAttachment}
              setAttachment={setAssigneeAttachment}
              category="assignee"
            />
            
            <Button 
              onClick={handleSubmitDeliverable} 
              disabled={isSubmitting || !assigneeAttachment || assigneeAttachment.length === 0}
            >
              {isSubmitting ? "جاري الرفع..." : "رفع المستلمات"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
