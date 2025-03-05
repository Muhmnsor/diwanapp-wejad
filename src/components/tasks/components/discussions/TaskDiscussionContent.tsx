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
export const TaskDiscussionContent = ({
  task
}: TaskDiscussionContentProps) => {
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [loading, setLoading] = useState(true);

  // استرجاع التعليقات
  useEffect(() => {
    fetchComments();
  }, [task.id]);
  const fetchComments = async () => {
    setLoading(true);
    try {
      console.log("Fetching comments for task:", task.id);

      // استرجاع التعليقات من الجدول الموحد
      const {
        data: unifiedComments,
        error: unifiedError
      } = await supabase.from("unified_task_comments").select("*").eq("task_id", task.id).order("created_at", {
        ascending: true
      });
      if (unifiedError) {
        console.error("Error fetching from unified_task_comments:", unifiedError);
        throw unifiedError;
      }
      console.log("Found unified comments:", unifiedComments);

      // للتوافق مع الكود القديم، سنقوم أيضًا بالبحث في الجداول القديمة
      const oldSources = [{
        table: "portfolio_task_comments",
        field: "task_id"
      }, {
        table: "task_comments",
        field: "task_id"
      }];
      let oldComments: any[] = [];

      // استرجاع التعليقات من الجداول القديمة
      for (const source of oldSources) {
        const {
          data,
          error
        } = await supabase.from(source.table).select("*").eq(source.field, task.id).order("created_at", {
          ascending: true
        });
        if (error) {
          console.warn(`Error fetching from ${source.table}:`, error);
        } else if (data && data.length > 0) {
          console.log(`Found ${data.length} comments in ${source.table}`);
          oldComments = [...oldComments, ...data];
        }
      }

      // دمج التعليقات من كلا المصدرين
      const allComments = [...(unifiedComments || []), ...(oldComments || [])];
      console.log("Combined comments data:", allComments);

      // إذا كان هناك بيانات، سنقوم بتحميل معلومات المستخدمين
      const commentsWithUserInfo = await Promise.all((allComments || []).map(async comment => {
        // إذا كان هناك معرف للمستخدم، فسنجلب معلومات المستخدم
        if (comment.created_by) {
          try {
            const {
              data: profileData,
              error: profileError
            } = await supabase.from("profiles").select("display_name, email").eq("id", comment.created_by).single();
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
  if (loading) {
    return <div className="flex justify-center items-center h-40">
        <p className="text-muted-foreground">جاري تحميل المناقشات...</p>
      </div>;
  }
  if (comments.length === 0) {
    return <div className="flex flex-col justify-center items-center h-40">
        <MessageCircle className="h-10 w-10 text-muted-foreground mb-2 opacity-50" />
        <p className="text-muted-foreground">لا توجد مناقشات حول هذه المهمة بعد</p>
        <p className="text-xs text-muted-foreground mt-1">كن أول من يضيف تعليقًا</p>
      </div>;
  }
  return <div className="space-y-4 my-0">
      {comments.map(comment => <CommentItem key={comment.id} comment={comment} />)}
    </div>;
};