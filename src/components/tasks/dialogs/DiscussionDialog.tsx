
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { Send } from "lucide-react";
import { toast } from "sonner";

interface DiscussionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: string;
  isGeneral?: boolean;
}

export const DiscussionDialog = ({
  open,
  onOpenChange,
  taskId,
  isGeneral = false
}: DiscussionDialogProps) => {
  const [comments, setComments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    if (open) {
      fetchComments();
    }
  }, [open, taskId]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("unified_task_comments")
        .select("*, profiles:created_by(display_name, email)")
        .eq("task_id", taskId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast.error("حدث خطأ أثناء تحميل التعليقات");
    } finally {
      setIsLoading(false);
    }
  };

  const addComment = async () => {
    if (!newComment.trim()) return;
    
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("unified_task_comments")
        .insert({
          task_id: taskId,
          content: newComment,
          created_by: user?.id,
          task_table: isGeneral ? "tasks" : "portfolio_tasks"
        })
        .select();

      if (error) throw error;
      setNewComment("");
      await fetchComments();
      toast.success("تم إضافة التعليق بنجاح");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("حدث خطأ أثناء إضافة التعليق");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>مناقشة المهمة</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {isLoading ? (
            <div className="text-center py-4">جاري تحميل التعليقات...</div>
          ) : comments.length === 0 ? (
            <div className="text-center py-4 text-gray-500">لا توجد تعليقات حاليًا</div>
          ) : (
            comments.map((comment) => (
              <div 
                key={comment.id} 
                className={`p-3 rounded-lg ${
                  comment.created_by === user?.id 
                    ? "bg-primary/10 mr-8" 
                    : "bg-muted ml-8"
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="font-medium">
                    {comment.profiles?.display_name || comment.profiles?.email || "مستخدم"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(comment.created_at)}
                  </div>
                </div>
                <div className="whitespace-pre-wrap text-sm">{comment.content}</div>
              </div>
            ))
          )}
        </div>
        
        <div className="border-t pt-4">
          <div className="flex gap-2">
            <Textarea
              placeholder="أضف تعليقًا..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="resize-none"
              rows={2}
            />
            <Button 
              onClick={addComment} 
              disabled={!newComment.trim() || isSubmitting}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
