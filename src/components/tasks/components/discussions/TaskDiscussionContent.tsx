
import { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { TaskComment } from "../../types/taskComment";
import { CommentItem } from "../CommentItem";
import { Task } from "../../types/task";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TaskDiscussionContentProps {
  task: Task;
}

export const TaskDiscussionContent = ({ task }: TaskDiscussionContentProps) => {
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [loading, setLoading] = useState(true);

  // استرجاع التعليقات
  useEffect(() => {
    fetchComments();
  }, [task.id]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      let tableName = task.is_subtask ? "portfolio_task_comments" : "task_comments";
      let query = supabase
        .from(tableName)
        .select(`
          id,
          task_id,
          content,
          created_at,
          created_by,
          attachment_url,
          attachment_name,
          attachment_type,
          profiles (display_name, email)
        `)
        .eq("task_id", task.id)
        .order("created_at", { ascending: true });
      
      const { data, error } = await query;
      
      if (error) {
        // محاولة استخدام جدول آخر إذا لم يعثر على الأول
        tableName = "task_comments";
        const { data: secondData, error: secondError } = await supabase
          .from(tableName)
          .select(`
            id,
            task_id,
            content,
            created_at,
            created_by,
            attachment_url,
            attachment_name,
            attachment_type,
            profiles (display_name, email)
          `)
          .eq("task_id", task.id)
          .order("created_at", { ascending: true });
          
        if (secondError) {
          throw secondError;
        }
        
        // تحويل البيانات إلى التنسيق المطلوب للـ TaskComment
        const formattedData: TaskComment[] = (secondData || []).map((item: any) => ({
          id: item.id,
          task_id: item.task_id,
          content: item.content,
          created_at: item.created_at,
          created_by: item.created_by,
          attachment_url: item.attachment_url,
          attachment_name: item.attachment_name,
          attachment_type: item.attachment_type,
          profiles: item.profiles,
        }));
        
        setComments(formattedData);
      } else {
        // تحويل البيانات إلى التنسيق المطلوب للـ TaskComment
        const formattedData: TaskComment[] = (data || []).map((item: any) => ({
          id: item.id,
          task_id: item.task_id,
          content: item.content,
          created_at: item.created_at,
          created_by: item.created_by,
          attachment_url: item.attachment_url,
          attachment_name: item.attachment_name,
          attachment_type: item.attachment_type,
          profiles: item.profiles,
        }));
        
        setComments(formattedData);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast.error("حدث خطأ أثناء استرجاع التعليقات");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <p className="text-muted-foreground">جاري تحميل المناقشات...</p>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-40">
        <MessageCircle className="h-10 w-10 text-muted-foreground mb-2 opacity-50" />
        <p className="text-muted-foreground">لا توجد مناقشات حول هذه المهمة بعد</p>
        <p className="text-xs text-muted-foreground mt-1">كن أول من يضيف تعليقًا</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </div>
  );
};
