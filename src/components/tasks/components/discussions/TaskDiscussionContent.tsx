import { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { TaskComment } from "../../types/taskComment";
import { CommentItem } from "../CommentItem";
import { Task } from "../../types/task";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TaskDiscussionContentProps {
  task: Task;
  newComment?: TaskComment; // إضافة خاصية اختيارية للتعليق الجديد
}

export const TaskDiscussionContent = ({ task, newComment }: TaskDiscussionContentProps) => {
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [loading, setLoading] = useState(true);

  // استرجاع التعليقات
  useEffect(() => {
    fetchComments();
  }, [task.id]);

  // إضافة التعليق الجديد للقائمة عند وصوله
  useEffect(() => {
    if (newComment) {
      console.log("Adding new comment to list:", newComment);
      // تحقق من عدم وجود التعليق بالفعل (تفادي التكرار)
      if (!comments.some(comment => comment.id === newComment.id)) {
        setComments(prevComments => [...prevComments, newComment]);
      }
    }
  }, [newComment]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      console.log("Fetching comments for task:", task.id);
      
      // تحديد جدول المهام المناسب بناءً على نوع المهمة
      let taskTable = '';
      
      // First check for meeting tasks
      const { data: meetingTaskCheck, error: meetingTaskError } = await supabase
        .from('meeting_tasks')
        .select('id')
        .eq('id', task.id)
        .single();
        
      if (!meetingTaskError && meetingTaskCheck) {
        taskTable = 'meeting_tasks';
        console.log("Task found in meeting_tasks table");
      } else {
        // Check if the task exists in the tasks table
        const { data: regularTaskCheck, error: regularTaskError } = await supabase
          .from('tasks')
          .select('id')
          .eq('id', task.id)
          .single();
          
        if (!regularTaskError && regularTaskCheck) {
          taskTable = 'tasks';
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
            console.log("Task found in portfolio_tasks table");
          }
        }
      }
      
      if (!taskTable) {
        console.error("Task not found in any task tables");
        throw new Error("Task not found in database");
      }
      
      // استرجاع التعليقات من الجدول الموحد أولاً
      const { data: unifiedComments, error: unifiedError } = await supabase
        .from("unified_task_comments")
        .select("*")
        .eq("task_id", task.id)
        .eq("task_table", taskTable)
        .order("created_at", { ascending: true });
      
      if (unifiedError) {
        console.error("Error fetching from unified_task_comments:", unifiedError);
        throw unifiedError;
      }
      
      console.log("Found unified comments:", unifiedComments?.length || 0);
      
      // إذا كان هناك بيانات، سنقوم بتحميل معلومات المستخدمين
      const commentsWithUserInfo = await Promise.all((unifiedComments || []).map(async (comment) => {
        // إذا كان هناك معرف للمستخدم، فسنجلب معلومات المستخدم
        if (comment.created_by) {
          try {
            const { data: profileData, error: profileError } = await supabase
              .from("profiles")
              .select("display_name, email")
              .eq("id", comment.created_by)
              .single();
            
            if (profileError) {
              console.warn("Error fetching profile:", profileError);
              return {
                ...comment,
                user_name: "مستخدم",
                user_email: null
              };
            }
            
            return {
              ...comment,
              user_name: profileData?.display_name || profileData?.email || "مستخدم",
              user_email: profileData?.email
            };
          } catch (profileErr) {
            console.error("Error in profile fetch:", profileErr);
            return {
              ...comment,
              user_name: "مستخدم",
              user_email: null
            };
          }
        }
        
        // إذا لم يكن هناك معرف للمستخدم، فسنعيد البيانات كما هي
        return {
          ...comment,
          user_name: "مستخدم",
          user_email: null
        };
      }));
      
      // ترتيب التعليقات حسب تاريخ الإنشاء
      const sortedComments = commentsWithUserInfo.sort((a, b) => {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        return dateA.getTime() - dateB.getTime();
      });
      
      console.log("Comments with user info:", sortedComments);
      setComments(sortedComments as TaskComment[]);
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast.error("حدث خطأ أثناء استرجاع التعليقات");
    } finally {
      setLoading(false);
    }
  };

  if (loading && comments.length === 0) {
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
