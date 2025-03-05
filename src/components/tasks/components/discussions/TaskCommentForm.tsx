
import { useState } from "react";
import { CommentForm } from "../comments/CommentForm";
import { uploadAttachment, saveAttachmentReference } from "../../services/uploadService";
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
      let attachmentError = false;

      if (selectedFile) {
        console.log("Starting to upload comment attachment:", selectedFile.name);
        
        // التأكد من إضافة تصنيف 'comment' للمرفق
        const category = 'comment';
        const uploadResult = await uploadAttachment(selectedFile, category);
        
        if (uploadResult && !uploadResult.error) {
          attachmentUrl = uploadResult.url;
          attachmentName = selectedFile.name;
          attachmentType = selectedFile.type;
          
          console.log("Comment attachment uploaded successfully:", attachmentUrl);
          
          try {
            // حفظ معلومات المرفق في قاعدة البيانات task_attachments
            await saveAttachmentReference(
              task.id,
              attachmentUrl,
              attachmentName,
              attachmentType,
              category
            );
            console.log("Attachment reference saved for comment");
          } catch (refError) {
            console.error("Failed to save attachment reference:", refError);
            attachmentError = true;
            // استمر في تنفيذ الكود حتى مع وجود خطأ في حفظ مرجع الملف
          }
        } else {
          console.error("Upload result error:", uploadResult?.error);
          attachmentError = true;
          // استمر في إنشاء التعليق حتى مع وجود خطأ في رفع الملف
        }
      }
      
      // إنشاء كائن التعليق
      const commentData = {
        task_id: task.id,
        content: commentText.trim() || " ", // استخدام مساحة فارغة إذا كان هناك مرفق فقط
        created_by: userId,
        attachment_url: attachmentUrl,
        attachment_name: attachmentName,
        attachment_type: attachmentType,
        task_table: 'tasks' // القيمة الافتراضية، سيتم تحديثها أدناه
      };

      // تحديد نوع جدول المهمة بناءً على وجود المهمة في الجداول المختلفة
      
      // فحص ما إذا كانت المهمة في جدول portfolio_tasks
      const { data: portfolioTask, error: portfolioError } = await supabase
        .from("portfolio_tasks")
        .select("id")
        .eq("id", task.id)
        .single();
        
      if (!portfolioError && portfolioTask) {
        commentData.task_table = "portfolio_tasks";
      } else {
        // فحص ما إذا كانت المهمة في جدول project_tasks
        const { data: projectTask, error: projectError } = await supabase
          .from("project_tasks")
          .select("id")
          .eq("id", task.id)
          .single();
          
        if (!projectError && projectTask) {
          commentData.task_table = "project_tasks";
        } else {
          // فحص ما إذا كانت المهمة في جدول tasks
          const { data: normalTask, error: normalTaskError } = await supabase
            .from("tasks")
            .select("id")
            .eq("id", task.id)
            .single();
            
          if (!normalTaskError && normalTask) {
            commentData.task_table = "tasks";
          } else {
            // فحص ما إذا كانت المهمة في جدول subtasks
            const { data: subTask, error: subTaskError } = await supabase
              .from("subtasks")
              .select("id")
              .eq("id", task.id)
              .single();
              
            if (!subTaskError && subTask) {
              commentData.task_table = "subtasks";
            }
          }
        }
      }
      
      console.log("Task table identified:", commentData.task_table);
      console.log("Adding comment to unified_task_comments:", commentData);
      
      // إضافة التعليق إلى جدول التعليقات الموحد
      const { error: insertError } = await supabase
        .from("unified_task_comments")
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
      
      if (attachmentError) {
        toast.warning("تم إضافة التعليق ولكن قد يكون هناك مشكلة في رفع المرفق");
      } else {
        toast.success("تم إضافة التعليق بنجاح");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("حدث خطأ أثناء إضافة التعليق");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      console.log("File selected for comment:", e.target.files[0].name);
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
