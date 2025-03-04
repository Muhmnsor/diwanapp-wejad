
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { CommentForm } from "./comments/CommentForm";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "../types/task";
import { TaskComment } from "../types/taskComment";
import { uploadAttachment } from "../services/uploadService";
import { toast } from "sonner";
import { TaskAttachments } from "./TaskAttachments";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TaskDiscussionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
}

export const TaskDiscussionDialog = ({
  open,
  onOpenChange,
  task,
}: TaskDiscussionDialogProps) => {
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState("comments");

  useEffect(() => {
    if (open && task?.id) {
      fetchComments();
    }
  }, [open, task?.id]);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      
      // جلب التعليقات مع معلومات المستخدم
      const { data, error } = await supabase
        .from('task_comments')
        .select(`
          *,
          profiles:created_by (
            display_name,
            email
          )
        `)
        .eq('task_id', task.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error("Error fetching comments:", error);
        return;
      }

      // تحويل البيانات إلى التنسيق المطلوب
      const formattedComments: TaskComment[] = data.map((comment: any) => ({
        id: comment.id,
        task_id: comment.task_id,
        content: comment.content,
        created_at: comment.created_at,
        created_by: comment.created_by,
        attachment_url: comment.attachment_url,
        attachment_name: comment.attachment_name,
        attachment_type: comment.attachment_type,
        user_name: comment.profiles?.display_name,
        user_email: comment.profiles?.email
      }));

      setComments(formattedComments);
    } catch (error) {
      console.error("Error in fetchComments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() && !selectedFile) return;

    setIsSubmitting(true);
    try {
      let attachmentUrl = '';
      let attachmentName = '';
      let attachmentType = '';

      // إذا كان هناك ملف مرفق، قم برفعه أولاً
      if (selectedFile) {
        const result = await uploadAttachment(selectedFile);
        if (result && !result.error) {
          attachmentUrl = result.url;
          attachmentName = selectedFile.name;
          attachmentType = selectedFile.type;
        } else {
          toast.error("فشل في رفع الملف المرفق");
          return;
        }
      }

      // إضافة التعليق إلى قاعدة البيانات
      const { data, error } = await supabase
        .from('task_comments')
        .insert({
          task_id: task.id,
          content: commentText.trim(),
          created_by: null, // يتم تحديثه من خلال RLS trigger
          attachment_url: attachmentUrl || null,
          attachment_name: attachmentName || null,
          attachment_type: attachmentType || null
        })
        .select();

      if (error) {
        console.error("Error adding comment:", error);
        toast.error("حدث خطأ أثناء إضافة التعليق");
        return;
      }

      // إعادة تعيين حالة النموذج
      setCommentText("");
      setSelectedFile(null);
      
      // تحديث قائمة التعليقات
      fetchComments();
      toast.success("تم إضافة التعليق بنجاح");
    } catch (error) {
      console.error("Error in handleSubmitComment:", error);
      toast.error("حدث خطأ أثناء إضافة التعليق");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">{task.title}</DialogTitle>
          <DialogDescription>
            {task.description || "لا يوجد وصف للمهمة"}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="comments">التعليقات</TabsTrigger>
            <TabsTrigger value="attachments">المرفقات</TabsTrigger>
          </TabsList>
          
          <TabsContent value="comments" className="space-y-4 mt-4">
            <div className="max-h-[300px] overflow-y-auto space-y-4 p-1">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  لا توجد تعليقات بعد. كن أول من يعلق!
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-2">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="text-xs">
                        {comment.user_name?.substring(0, 2) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-gray-100 p-3 rounded-lg">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-sm">
                            {comment.user_name || comment.user_email || "مستخدم مجهول"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                        {comment.attachment_url && (
                          <div className="mt-2 p-2 bg-gray-200 rounded-md">
                            <a
                              href={comment.attachment_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 text-sm flex items-center gap-1"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                              </svg>
                              {comment.attachment_name || "مرفق"}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <CommentForm
              onSubmit={handleSubmitComment}
              text={commentText}
              onTextChange={setCommentText}
              selectedFile={selectedFile}
              onFileChange={handleFileChange}
              onFileRemove={handleFileRemove}
              isSubmitting={isSubmitting}
              workspaceId={task.workspace_id}
            />
          </TabsContent>
          
          <TabsContent value="attachments" className="mt-4">
            <TaskAttachments taskId={task.id} canEdit={true} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
