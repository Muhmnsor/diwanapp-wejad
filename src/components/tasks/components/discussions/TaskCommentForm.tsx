
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
      // الحصول على معرف المستخدم الحالي
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || null;
      
      console.log("Current user ID:", userId);
      console.log("Task ID:", task.id);
      
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
      
      // تحقق من وجود المهمة في جدول portfolio_tasks
      const { data: portfolioTask } = await supabase
        .from("portfolio_tasks")
        .select("id")
        .eq("id", task.id)
        .single();
        
      if (portfolioTask) {
        // إنشاء تعليق جديد في جدول portfolio_task_comments
        const { error } = await supabase
          .from("portfolio_task_comments")
          .insert({
            task_id: task.id,
            content: commentText.trim() || " ", // استخدام مساحة فارغة إذا كان هناك مرفق فقط
            created_at: new Date().toISOString(),
            created_by: userId,
            attachment_url: attachmentUrl,
            attachment_name: attachmentName,
            attachment_type: attachmentType
          });
        
        if (error) {
          console.error("Error details:", error);
          throw error;
        }
      } else {
        // المهمة غير موجودة في جدول portfolio_tasks، قم بالتحقق من جدول project_tasks
        const { data: projectTask } = await supabase
          .from("project_tasks")
          .select("id")
          .eq("id", task.id)
          .single();
          
        if (projectTask) {
          // إنشاء تعليق جديد في جدول task_comments
          const { error } = await supabase
            .from("task_comments")
            .insert({
              task_id: task.id,
              content: commentText.trim() || " ", // استخدام مساحة فارغة إذا كان هناك مرفق فقط
              created_at: new Date().toISOString(),
              created_by: userId,
              attachment_url: attachmentUrl,
              attachment_name: attachmentName,
              attachment_type: attachmentType
            });
          
          if (error) {
            console.error("Error details:", error);
            throw error;
          }
        } else {
          // المهمة غير موجودة في أي من الجدولين
          throw new Error("Task not found in any tables");
        }
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
