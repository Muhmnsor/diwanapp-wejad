
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
      // استعلام مبسط بدون JOIN
      const { data, error } = await supabase
        .from("task_comments")
        .select("*")
        .eq("task_id", task.id)
        .order("created_at", { ascending: true });
          
      if (error) {
        throw error;
      }
      
      // إذا كان هناك بيانات، سنقوم بتحميل معلومات المستخدمين
      const commentsWithUserInfo = await Promise.all((data || []).map(async (comment) => {
        // إذا كان هناك معرف للمستخدم، فسنجلب معلومات المستخدم
        if (comment.created_by) {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("display_name, email")
            .eq("id", comment.created_by)
            .single();
          
          return {
            ...comment,
            user_name: profileData?.display_name || profileData?.email || "مستخدم",
            user_email: profileData?.email
          };
        }
        
        // إذا لم يكن هناك معرف للمستخدم، فسنعيد البيانات كما هي
        return {
          ...comment,
          user_name: "مستخدم",
          user_email: null
        };
      }));
      
      setComments(commentsWithUserInfo as TaskComment[]);
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
