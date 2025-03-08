import { useState } from "react";
import { CommentForm } from "../comments/CommentForm";
import { uploadAttachment, saveAttachmentReference } from "../../services/uploadService";
import { Task } from "../../types/task";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TaskComment } from "../../types/taskComment";
import { useTaskNotifications } from "@/hooks/useTaskNotifications";

interface TaskCommentFormProps {
  task: Task;
  onCommentAdded: (newComment?: TaskComment) => void;
  onTaskStatusChanged?: (taskId: string, newStatus: string) => void;
}

export const TaskCommentForm = ({ task, onCommentAdded, onTaskStatusChanged }: TaskCommentFormProps) => {
  const [commentText, setCommentText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { sendTaskStatusUpdateNotification, sendTaskCommentNotification } = useTaskNotifications();

  const handleSubmitComment = async () => {
    if (!commentText.trim() && !selectedFile) return;
    
    setIsSubmitting(true);
    
    try {
      // الحصول على معرف المستخدم الحالي
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || null;
      
      console.log("Current user ID:", userId);
      console.log("Task ID:", task.id);
      console.log("Task assigned to:", task.assigned_to);
      
      // رفع المرفق إذا كان موجودًا
      let attachmentUrl = null;
      let attachmentName = null;
      let attachmentType = null;
      let attachmentError = false;

      if (selectedFile) {
        console.log("Starting to upload comment attachment:", selectedFile.name);
        
        // Use the correct type for the attachment category
        const uploadResult = await uploadAttachment(selectedFile, 'comment');
        
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
              'comment'
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
      
      // تحديد جدول المهام المناسب بناءً على نوع المهمة
      // Check if the task is a portfolio task or regular task
      let taskTable = 'tasks';
      let taskExists = false;
      
      // First, check if the task exists in the tasks table
      const { data: regularTaskCheck, error: regularTaskError } = await supabase
        .from('tasks')
        .select('id')
        .eq('id', task.id)
        .single();
        
      if (!regularTaskError && regularTaskCheck) {
        taskTable = 'tasks';
        taskExists = true;
        console.log("Task found in tasks table");
      } else {
        // If not in regular tasks, check portfolio_tasks
        const { data: portfolioTaskCheck, error: portfolioTaskError } = await supabase
          .from('portfolio_tasks')
          .select('id')
          .eq('id', task.id)
          .single();
          
        if (!portfolioTaskError && portfolioTaskCheck) {
          taskTable = 'portfolio_tasks';
          taskExists = true;
          console.log("Task found in portfolio_tasks table");
        }
      }
      
      if (!taskExists) {
        console.error("Task not found in any task tables");
        throw new Error("Task not found in database");
      }
      
      // إنشاء كائن التعليق للجدول الموحد
      const unifiedCommentData = {
        task_id: task.id,
        content: commentText.trim() || " ", // استخدام مساحة فارغة إذا كان هناك مرفق فقط
        created_by: userId,
        attachment_url: attachmentUrl,
        attachment_name: attachmentName,
        attachment_type: attachmentType,
        task_table: taskTable // إضافة حقل task_table
      };
      
      console.log("Adding comment to unified_task_comments:", unifiedCommentData);
      
      // محاولة الإضافة في الجدول الموحد أولاً
      const { data: unifiedInsertedComment, error: unifiedInsertError } = await supabase
        .from("unified_task_comments")
        .insert(unifiedCommentData)
        .select()
        .single();
        
      if (unifiedInsertError) {
        console.error("Error details for unified_task_comments insert:", unifiedInsertError);
        
        // في حالة فشل الإضافة للجدول الموحد، نستخدم دالة create-notification للتخطي
        const { data: functionData, error: functionError } = await supabase.functions.invoke('create-notification', {
          body: {
            type: 'comment_insert',
            comment: unifiedCommentData
          }
        });
        
        if (functionError) {
          console.error("Error in edge function:", functionError);
          throw new Error("Failed to create comment via edge function");
        }
        
        console.log("Comment created via function:", functionData);
        
        if (functionData) {
          // إضافة بيانات المستخدم للتعليق المضاف
          const { data: userData } = await supabase
            .from("profiles")
            .select("display_name, email")
            .eq("id", userId)
            .single();
            
          const newComment: TaskComment = {
            ...functionData,
            user_name: userData?.display_name || userData?.email || "مستخدم"
          };
          
          // تمرير التعليق الجديد لتحديث القائمة بدون إعادة التحميل الكامل
          onCommentAdded(newComment);
        } else {
          // إذا لم نحصل على بيانات، نقوم بتحديث القائمة
          onCommentAdded();
        }
      } else if (unifiedInsertedComment) {
        // إضافة بيانات المستخدم للتعليق المضاف
        const { data: userData } = await supabase
          .from("profiles")
          .select("display_name, email")
          .eq("id", userId)
          .single();
          
        const newComment: TaskComment = {
          ...unifiedInsertedComment,
          user_name: userData?.display_name || userData?.email || "مستخدم"
        };
        
        // تمرير التعليق الجديد لتحديث القائمة بدون إعادة التحميل الكامل
        onCommentAdded(newComment);
      }
      
      // تحديث حالة المهمة إذا كانت مكتملة
      if (task.status === 'completed' && onTaskStatusChanged) {
        console.log("Task is completed and has a new comment, updating status to in_progress");
        
        // تحديث حالة المهمة إلى قيد التنفيذ
        await onTaskStatusChanged(task.id, 'in_progress');
        
        // إرسال إشعار للمكلف بالمهمة إذا كان مختلفًا عن المستخدم الحالي
        if (task.assigned_to && task.assigned_to !== userId) {
          try {
            // الحصول على اسم المستخدم الحالي
            const { data: userData } = await supabase
              .from("profiles")
              .select("display_name, email")
              .eq("id", userId)
              .single();
              
            const userName = userData?.display_name || userData?.email || "مستخدم";
            
            console.log("Sending notification to:", task.assigned_to, "from user:", userName);

            // إرسال الإشعار باستخدام وظيفة sendTaskCommentNotification
            await sendTaskCommentNotification({
              taskId: task.id,
              taskTitle: task.title,
              projectId: task.project_id,
              projectTitle: task.project_name,
              assignedUserId: task.assigned_to,
              updatedByUserId: userId,
              updatedByUserName: userName
            });
          } catch (notificationError) {
            console.error("Error sending notification:", notificationError);
          }
        } else {
          console.log("No notification sent: User is commenting on their own task or task has no assignee");
        }
      }
      
      // مسح حقل التعليق والملف بعد النجاح
      setCommentText("");
      setSelectedFile(null);
      
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
