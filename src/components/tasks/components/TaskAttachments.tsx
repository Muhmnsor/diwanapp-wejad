
import { useState, useEffect } from "react";
import { Paperclip, ExternalLink, Download, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { uploadAttachment } from "../services/uploadService";
import { toast } from "sonner";

interface Attachment {
  id: string;
  task_id: string;
  file_name: string;
  file_url: string;
  created_at: string;
  created_by: string | null;
}

interface TaskAttachmentsProps {
  taskId: string;
  canEdit?: boolean;
}

export const TaskAttachments = ({ taskId, canEdit = false }: TaskAttachmentsProps) => {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchAttachments();
  }, [taskId]);

  const fetchAttachments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("task_attachments")
        .select("*")
        .eq("task_id", taskId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching attachments:", error);
        return;
      }

      setAttachments(data || []);
    } catch (error) {
      console.error("Error in fetchAttachments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await uploadAttachment(file);
      if (result && result.url) {
        // إضافة المرفق إلى قاعدة البيانات
        const { error } = await supabase.from("task_attachments").insert({
          task_id: taskId,
          file_name: file.name,
          file_url: result.url,
          created_by: null,
        });

        if (error) {
          console.error("Error adding attachment to database:", error);
          toast.error("حدث خطأ أثناء حفظ المرفق");
          return;
        }

        toast.success("تم رفع المرفق بنجاح");
        // تحديث قائمة المرفقات
        fetchAttachments();
      } else {
        toast.error("فشل في رفع المرفق");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("حدث خطأ أثناء رفع المرفق");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleRemoveAttachment = async (attachmentId: string) => {
    try {
      const { error } = await supabase
        .from("task_attachments")
        .delete()
        .eq("id", attachmentId);

      if (error) {
        console.error("Error removing attachment:", error);
        toast.error("حدث خطأ أثناء حذف المرفق");
        return;
      }

      toast.success("تم حذف المرفق بنجاح");
      // تحديث قائمة المرفقات
      setAttachments(attachments.filter((attachment) => attachment.id !== attachmentId));
    } catch (error) {
      console.error("Error in handleRemoveAttachment:", error);
      toast.error("حدث خطأ أثناء حذف المرفق");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-4">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  const isImage = (fileName: string): boolean => {
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
    const extension = fileName.substring(fileName.lastIndexOf(".")).toLowerCase();
    return imageExtensions.includes(extension);
  };

  const isPdf = (fileName: string): boolean => {
    return fileName.toLowerCase().endsWith(".pdf");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-md font-medium">المرفقات ({attachments.length})</h3>
        {canEdit && (
          <div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => document.getElementById("add-task-attachment")?.click()}
              disabled={isUploading}
              className="flex items-center gap-2 text-sm"
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Paperclip className="h-4 w-4" />
              )}
              إضافة مرفق
              <input
                type="file"
                id="add-task-attachment"
                className="hidden"
                onChange={handleFileChange}
                accept="image/*,.pdf,.doc,.docx,.txt,.xlsx,.csv"
              />
            </Button>
          </div>
        )}
      </div>

      {attachments.length === 0 ? (
        <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-md">
          لا توجد مرفقات
        </div>
      ) : (
        <div className="grid gap-3">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center justify-between bg-gray-50 p-3 rounded-md"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                {isImage(attachment.file_name) ? (
                  <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center overflow-hidden">
                    <img
                      src={attachment.file_url}
                      alt={attachment.file_name}
                      className="object-cover h-full w-full"
                    />
                  </div>
                ) : isPdf(attachment.file_name) ? (
                  <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center text-red-500">
                    PDF
                  </div>
                ) : (
                  <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center">
                    <Paperclip className="h-4 w-4 text-gray-500" />
                  </div>
                )}
                <div className="overflow-hidden">
                  <p className="text-sm font-medium truncate" title={attachment.file_name}>
                    {attachment.file_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(attachment.created_at).toLocaleDateString("ar-SA")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={attachment.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded-full hover:bg-gray-200"
                  title="فتح في صفحة جديدة"
                >
                  <ExternalLink className="h-4 w-4 text-gray-500" />
                </a>
                <a
                  href={attachment.file_url}
                  download={attachment.file_name}
                  className="p-1 rounded-full hover:bg-gray-200"
                  title="تنزيل"
                >
                  <Download className="h-4 w-4 text-gray-500" />
                </a>
                {canEdit && (
                  <button
                    onClick={() => handleRemoveAttachment(attachment.id)}
                    className="p-1 rounded-full hover:bg-gray-200"
                    title="حذف"
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
