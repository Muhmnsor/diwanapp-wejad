
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { uploadAttachment, saveAttachmentReference } from "../../services/uploadService";
import { PaperclipIcon, SendHorizonal, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface TaskCommentFormProps {
  taskId: string;
  onCommentAdded: () => void;
  taskTable?: string;
  placeholder?: string;
}

export const TaskCommentForm = ({ 
  taskId, 
  onCommentAdded, 
  taskTable = "tasks",
  placeholder = "اكتب تعليقًا..."
}: TaskCommentFormProps) => {
  const [content, setContent] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentName, setAttachmentName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() && !attachment) {
      toast.error("يجب إدخال تعليق أو إرفاق ملف");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // معالجة المرفق إذا كان موجودًا
      let attachmentUrl = null;
      let attachmentType = null;
      
      if (attachment) {
        const { url, error } = await uploadAttachment(attachment, "comment");
        
        if (error) {
          throw new Error(error);
        }
        
        if (url) {
          attachmentUrl = url;
          attachmentType = attachment.type;
          
          // حفظ مرجع الملف المرفق في قاعدة البيانات
          await saveAttachmentReference(
            taskId,
            url,
            attachment.name,
            attachment.type,
            "comment"
          );
        }
      }
      
      // إضافة التعليق إلى قاعدة البيانات
      const { error } = await supabase
        .from("unified_task_comments")
        .insert({
          task_id: taskId,
          content: content.trim(),
          attachment_url: attachmentUrl,
          attachment_name: attachment ? attachment.name : null,
          attachment_type: attachmentType,
          task_table: taskTable
        });
      
      if (error) {
        throw error;
      }
      
      toast.success("تمت إضافة التعليق بنجاح");
      setContent("");
      setAttachment(null);
      setAttachmentName("");
      onCommentAdded();
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
          onClick={() => document.getElementById(`comment-file-${taskId}`)?.click()}
          disabled={isSubmitting}
        >
          <PaperclipIcon className="h-4 w-4 mr-1" />
          إرفاق ملف
        </Button>
        <input
          id={`comment-file-${taskId}`}
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
