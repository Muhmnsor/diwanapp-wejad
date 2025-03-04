
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Task } from "../types/task";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TaskComment } from "../types/taskComment";
import { MessageCircle } from "lucide-react";
import { CommentItem } from "./CommentItem";
import { Separator } from "@/components/ui/separator";
import { CommentForm } from "./comments/CommentForm";

interface TaskDiscussionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
}

export const TaskDiscussionDialog = ({ open, onOpenChange, task }: TaskDiscussionDialogProps) => {
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // استرجاع التعليقات عند فتح مربع الحوار
  useEffect(() => {
    if (open) {
      fetchComments();
    }
  }, [open, task.id]);

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
            profiles (display_name, email)
          `)
          .eq("task_id", task.id)
          .order("created_at", { ascending: true });
          
        if (secondError) {
          throw secondError;
        }
        
        const formattedData = (secondData || []).map(item => ({
          ...item,
          profiles: item.profiles ? {
            display_name: item.profiles.display_name,
            email: item.profiles.email
          } : undefined
        }));
        
        setComments(formattedData);
      } else {
        const formattedData = (data || []).map(item => ({
          ...item,
          profiles: item.profiles ? {
            display_name: item.profiles.display_name,
            email: item.profiles.email
          } : undefined
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

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      // تحديد الجدول المناسب بناءً على نوع المهمة
      const tableName = task.is_subtask ? "portfolio_task_comments" : "task_comments";
      
      const { error } = await supabase
        .from(tableName)
        .insert({
          task_id: task.id,
          content: commentText.trim(),
          created_at: new Date().toISOString()
        });
      
      if (error) {
        throw error;
      }
      
      // مسح حقل التعليق بعد النجاح
      setCommentText("");
      setSelectedFile(null);
      
      // إعادة تحميل التعليقات
      fetchComments();
      
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
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[80vh] overflow-hidden flex flex-col" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            <span>مناقشة حول: {task.title}</span>
          </DialogTitle>
        </DialogHeader>
        
        <Separator className="my-4" />
        
        <div className="overflow-y-auto flex-1 pr-1 -mr-1 mb-4">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <p className="text-muted-foreground">جاري تحميل المناقشات...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-40">
              <MessageCircle className="h-10 w-10 text-muted-foreground mb-2 opacity-50" />
              <p className="text-muted-foreground">لا توجد مناقشات حول هذه المهمة بعد</p>
              <p className="text-xs text-muted-foreground mt-1">كن أول من يضيف تعليقًا</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </div>
          )}
        </div>
        
        <div className="mt-auto">
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
        </div>
      </DialogContent>
    </Dialog>
  );
};
