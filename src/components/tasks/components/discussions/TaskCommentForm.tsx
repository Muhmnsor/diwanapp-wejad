
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
      
      // تحديد نوع المهمة - مهمة مشروع أم مهمة محفظة أم مهمة فرعية
      let taskTable = null;
      let commentTable = null;
      
      // فحص ما إذا كانت المهمة في جدول portfolio_tasks
      const { data: portfolioTask, error: portfolioError } = await supabase
        .from("portfolio_tasks")
        .select("id")
        .eq("id", task.id)
        .single();
        
      if (!portfolioError && portfolioTask) {
        taskTable = "portfolio_tasks";
        commentTable = "portfolio_task_comments";
      } else {
        // فحص ما إذا كانت المهمة في جدول project_tasks
        const { data: projectTask, error: projectError } = await supabase
          .from("project_tasks")
          .select("id")
          .eq("id", task.id)
          .single();
          
        if (!projectError && projectTask) {
          taskTable = "project_tasks";
          commentTable = "task_comments";
        } else {
          // فحص ما إذا كانت المهمة في جدول tasks
          const { data: normalTask, error: normalTaskError } = await supabase
            .from("tasks")
            .select("id")
            .eq("id", task.id)
            .single();
            
          if (!normalTaskError && normalTask) {
            taskTable = "tasks";
            commentTable = "task_comments";
          } else {
            // فحص ما إذا كانت المهمة في جدول subtasks
            const { data: subTask, error: subTaskError } = await supabase
              .from("subtasks")
              .select("id")
              .eq("id", task.id)
              .single();
              
            if (!subTaskError && subTask) {
              taskTable = "subtasks";
              commentTable = "task_comments";
            }
          }
        }
      }
      
      console.log("Task table identified:", taskTable);
      console.log("Comment table to use:", commentTable);
      
      if (!taskTable || !commentTable) {
        console.error("Task not found in any table", {
          portfolioError,
          projectError: task.project_id ? undefined : "Not checked - No project_id",
          normalTaskError: task.assigned_to ? undefined : "Not checked - No assigned_to",
          subTaskError: task.id ? undefined : "Not checked - No task_id"
        });
        throw new Error("المهمة غير موجودة في قاعدة البيانات");
      }
      
      // إنشاء تعليق جديد في الجدول المناسب
      const commentData = {
        task_id: task.id,
        content: commentText.trim() || " ", // استخدام مساحة فارغة إذا كان هناك مرفق فقط
        created_at: new Date().toISOString(),
        created_by: userId,
        attachment_url: attachmentUrl,
        attachment_name: attachmentName,
        attachment_type: attachmentType
      };

      console.log("Inserting comment data:", commentData);
      
      const { error: insertError } = await supabase
        .from(commentTable)
        .insert(commentData);
        
      if (insertError) {
        console.error("Error details for insert:", insertError);
        throw insertError;
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
