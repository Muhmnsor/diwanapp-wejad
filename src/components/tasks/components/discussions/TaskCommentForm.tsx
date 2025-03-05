
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
            // حفظ معلومات المرفق في قاعدة البيانات
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
          }
        } else {
          console.error("Upload result error:", uploadResult?.error);
          attachmentError = true;
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
        task_table: 'tasks' // القيمة الافتراضية
      };
      
      console.log("Adding comment to unified_task_comments:", commentData);
      
      // Check if unified_task_comments exists first
      const { data: tableExists } = await supabase.rpc('check_table_exists', {
        table_name: 'unified_task_comments'
      });
      
      if (tableExists && tableExists.length > 0 && tableExists[0].table_exists) {
        console.log("unified_task_comments table exists, inserting comment");
        const { error: insertError } = await supabase
          .from("unified_task_comments")
          .insert(commentData);
          
        if (insertError) {
          console.error("Error details for insert:", insertError);
          throw insertError;
        }
      } else {
        console.log("unified_task_comments table doesn't exist, trying task_comments");
        const { error: insertError } = await supabase
          .from("task_comments")
          .insert(commentData);
          
        if (insertError) {
          console.error("Error details for insert:", insertError);
          throw insertError;
        }
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
