
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TaskComment } from "../../types/taskComment";
import { Task } from "../../types/task";
import { CommentItem } from "../CommentItem";
import { TaskAttachments } from "../TaskAttachments";

interface TaskDiscussionContentProps {
  task: Task;
}

export const TaskDiscussionContent = ({ task }: TaskDiscussionContentProps) => {
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const { data, error } = await supabase
          .from('unified_task_comments')
          .select('*')
          .eq('task_id', task.id)
          .order('created_at', { ascending: true });
        
        if (error) throw error;
        
        setComments(data || []);
      } catch (error) {
        console.error("Error fetching comments:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchComments();
    
    // إعداد الاستماع لتحديثات التعليقات في الوقت الحقيقي
    const commentsSubscription = supabase
      .channel('unified_task_comments_changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'unified_task_comments',
        filter: `task_id=eq.${task.id}`,
      }, (payload) => {
        setComments(prevComments => [...prevComments, payload.new as TaskComment]);
      })
      .subscribe();
    
    // تنظيف الاشتراك عند إزالة المكون
    return () => {
      commentsSubscription.unsubscribe();
    };
  }, [task.id]);
  
  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-pulse">جاري تحميل المناقشات...</div>
      </div>
    );
  }
  
  if (comments.length === 0) {
    return (
      <div className="space-y-4">
        <div className="p-4 text-center">
          <p className="text-muted-foreground">لا توجد تعليقات حتى الآن</p>
        </div>
        <TaskAttachments taskId={task.id} />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </div>
      <TaskAttachments taskId={task.id} />
    </div>
  );
};
