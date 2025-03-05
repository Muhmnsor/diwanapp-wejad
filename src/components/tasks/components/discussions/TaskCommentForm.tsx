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
        // التأكد من إضافة تصنيف 'comment' للمرفق
        const category = (selectedFile as any).category || 'comment';
        const uploadResult = await uploadAttachment(selectedFile, category);
        if (uploadResult && !uploadResult.error) {
          attachmentUrl = uploadResult.url;
          attachmentName = selectedFile.name;
          attachmentType = selectedFile.type;
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
        task_table: 'portfolio_tasks' // القيمة الافتراضية، سيتم تحديثها أدناه
      };

      // تحديد نوع جدول المهمة بناءً على وجود المهمة في الجداول ا��مختلفة
      
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
      // ضمان تعيين تصنيف 'comment' للملف
      const file = e.target.files[0];
      // لا يمكن إضافة خصائص إضافية مباشرة إلى كائن File 
      // لذلك نستخدم خاصية تُحفظ في الذاكرة
      const fileWithCategory = Object.assign(file, { category: 'comment' });
      setSelectedFile(fileWithCategory);
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
