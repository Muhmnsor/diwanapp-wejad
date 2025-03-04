
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
      const { data, error } = await supabase
        .from("task_comments")
        .select(`
          id,
          task_id,
          content,
          created_at,
          created_by,
          attachment_url,
          attachment_name,
          attachment_type,
          profiles(display_name, email)
        `)
        .eq("task_id", task.id)
        .order("created_at", { ascending: true });
          
      if (error) {
        throw error;
      }
      
      // تحويل البيانات إلى التنسيق المطلوب للـ TaskComment
      setComments(data || []);
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
