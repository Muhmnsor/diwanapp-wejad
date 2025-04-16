
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { uploadAttachment, saveAttachmentReference } from "../../services/uploadService";
import { PaperclipIcon, SendHorizonal, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Task } from "../../types/task";
import { TaskComment } from "../../types/taskComment";

interface TaskCommentFormProps {
  taskId?: string;
  task?: Task;
  onCommentAdded: (newComment?: TaskComment) => void;
  taskTable?: string;
  placeholder?: string;
  onTaskStatusChanged?: (taskId: string, newStatus: string) => Promise<void>;
}

export const TaskCommentForm = ({ 
  taskId, 
  task,
  onCommentAdded, 
  taskTable = "tasks",
  placeholder = "اكتب تعليقًا...",
  onTaskStatusChanged
}: TaskCommentFormProps) => {
  const [content, setContent] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentName, setAttachmentName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get the taskId either from direct prop or from task object
  const actualTaskId = task?.id || taskId;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!actualTaskId) {
      toast.error("معرف المهمة غير متوفر");
      return;
    }
    
    if (!content.trim() && !attachment) {
      toast.error("يجب إدخال تعليق أو إرفاق ملف");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // معالجة المرفق إذا كان موجودًا
      let attachmentUrl = null;
      let attachmentType = null;
      let attachmentFileName = null;
      
      if (attachment) {
        const { url, error } = await uploadAttachment(attachment, "comment");
        
        if (error) {
          throw new Error(error);
        }
        
        if (url) {
          attachmentUrl = url;
          attachmentType = attachment.type;
          attachmentFileName = attachment.name;
          
          // حفظ مرجع الملف المرفق في قاعدة البيانات
          await saveAttachmentReference(
            actualTaskId,
            url,
            attachment.name,
            attachment.type,
            "comment"
          );
        }
      }
      
      // إضافة التعليق إلى قاعدة البيانات
      const { data, error } = await supabase
        .from("unified_task_comments")
        .insert({
          task_id: actualTaskId,
          content: content.trim(),
          attachment_url: attachmentUrl,
          attachment_name: attachmentFileName,
          attachment_type: attachmentType,
          task_table: taskTable,
          created_by: user.user?.id
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // إذا كانت هذه هي أول مرة يتم فيها التعليق على المهمة وكانت المهمة في حالة "pending"، قم بتغيير حالتها إلى "in_progress"
      if (task && task.status === "pending" && onTaskStatusChanged) {
        await onTaskStatusChanged(actualTaskId, "in_progress");
      }
      
      toast.success("تمت إضافة التعليق بنجاح");
      setContent("");
      setAttachment(null);
      setAttachmentName("");
      onCommentAdded(data);
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("حدث خطأ أثناء إضافة التعليق");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setAttachment(files[0]);
      setAttachmentName(files[0].name);
    }
  };
  
  const clearAttachment = () => {
    setAttachment(null);
    setAttachmentName("");
  };
  
  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <Textarea
        placeholder={placeholder}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        disabled={isSubmitting}
        className="mb-2"
      />
      
      {attachmentName && (
        <div className="flex items-center mb-2 p-2 bg-gray-50 rounded">
          <PaperclipIcon className="h-4 w-4 mr-2 text-gray-500" />
          <span className="text-sm text-gray-700 truncate flex-1">{attachmentName}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearAttachment}
            disabled={isSubmitting}
          >
            إزالة
          </Button>
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => document.getElementById(`comment-file-${actualTaskId}`)?.click()}
          disabled={isSubmitting}
        >
          <PaperclipIcon className="h-4 w-4 mr-1" />
          إرفاق ملف
        </Button>
        <input
          id={`comment-file-${actualTaskId}`}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          disabled={isSubmitting}
        />
        
        <Button
          type="submit"
          disabled={isSubmitting || (!content.trim() && !attachment)}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              جاري الإرسال...
            </>
          ) : (
            <>
              <SendHorizonal className="h-4 w-4 mr-2" />
              إرسال
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
