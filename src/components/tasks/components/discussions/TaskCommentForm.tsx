
import { useState } from "react";
import { CommentForm } from "../comments/CommentForm";
import { uploadAttachment } from "../../services/uploadService";
import { Task } from "../../types/task";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TaskCommentFormProps {
  task: Task;
  onCommentAdded: () => void;
}

export const TaskCommentForm = ({ task, onCommentAdded }: TaskCommentFormProps) => {
  const [commentText, setCommentText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitComment = async () => {
    if (!commentText.trim() && !selectedFile) return;
    
    setIsSubmitting(true);
    
    try {
      // رفع المرفق إذا كان موجودًا
      let attachmentUrl = null;
      let attachmentName = null;
      let attachmentType = null;

      if (selectedFile) {
        const uploadResult = await uploadAttachment(selectedFile);
        if (uploadResult && !uploadResult.error) {
          attachmentUrl = uploadResult.url;
          attachmentName = selectedFile.name;
          attachmentType = selectedFile.type;
        }
      }
      
      // تحديد الجدول المناسب بناءً على نوع المهمة
      const tableName = task.parent_task_id ? "subtasks" : "tasks";
      const taskId = task.id;
      
      // إنشاء تعليق جديد
      const { error } = await supabase
        .from("task_comments")
        .insert({
          task_id: taskId,
          content: commentText.trim() || " ", // استخدام مساحة فارغة إذا كان هناك مرفق فقط
          created_at: new Date().toISOString(),
          created_by: supabase.auth.getUser().then(resp => resp.data.user?.id),
          attachment_url: attachmentUrl,
          attachment_name: attachmentName,
          attachment_type: attachmentType
        });
      
      if (error) {
        throw error;
      }
      
      // مسح حقل التعليق والملف بعد النجاح
      setCommentText("");
      setSelectedFile(null);
      
      // تحديث التعليقات
      onCommentAdded();
      
      toast.success("تم إضافة التعليق بنجاح");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("حدث خطأ أثناء إضافة التعليق");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
  };

  return (
    <CommentForm
      onSubmit={handleSubmitComment}
      text={commentText}
      onTextChange={setCommentText}
      selectedFile={selectedFile}
      onFileChange={handleFileChange}
      onFileRemove={handleFileRemove}
      isSubmitting={isSubmitting}
      placeholder="أضف تعليقك حول المهمة..."
      workspaceId={task.workspace_id}
    />
  );
};
