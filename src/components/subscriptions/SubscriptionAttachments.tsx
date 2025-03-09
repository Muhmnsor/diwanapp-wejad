
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, File, FileText, Trash } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Attachment {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string | null;
  file_size: number | null;
  created_at: string;
}

interface SubscriptionAttachmentsProps {
  subscriptionId: string;
}

export const SubscriptionAttachments = ({ subscriptionId }: SubscriptionAttachmentsProps) => {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAttachments();
  }, [subscriptionId]);

  const fetchAttachments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('subscription_attachments')
        .select('*')
        .eq('subscription_id', subscriptionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAttachments(data || []);
    } catch (error) {
      console.error("Error fetching attachments:", error);
      toast.error("حدث خطأ أثناء تحميل المرفقات");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadAttachment = async (attachment: Attachment) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(attachment.file_path);

      if (error) throw error;

      // Create a blob URL and trigger download
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.file_name;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading attachment:", error);
      toast.error("حدث خطأ أثناء تنزيل المرفق");
    }
  };

  const deleteAttachment = async (attachmentId: string, filePath: string) => {
    try {
      // Delete file from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([filePath]);

      if (storageError) {
        console.error("Error deleting file from storage:", storageError);
        // Continue anyway to delete the record
      }

      // Delete record from database
      const { error } = await supabase
        .from('subscription_attachments')
        .delete()
        .eq('id', attachmentId);

      if (error) throw error;

      toast.success("تم حذف المرفق بنجاح");
      fetchAttachments();
    } catch (error) {
      console.error("Error deleting attachment:", error);
      toast.error("حدث خطأ أثناء حذف المرفق");
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">جاري تحميل المرفقات...</div>;
  }

  if (attachments.length === 0) {
    return <div className="text-center py-4 text-gray-500">لا توجد مرفقات</div>;
  }

  return (
    <div className="space-y-2">
      {attachments.map((attachment) => (
        <div
          key={attachment.id}
          className="flex items-center justify-between border rounded-lg p-3"
        >
          <div className="flex items-center space-x-2 space-x-reverse">
            <div className="bg-gray-100 p-2 rounded">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-sm">{attachment.file_name}</h4>
              <p className="text-xs text-gray-500">
                {attachment.file_size
                  ? `${Math.round(attachment.file_size / 1024)} KB`
                  : "حجم غير معروف"}
              </p>
            </div>
          </div>
          <div className="flex space-x-2 space-x-reverse">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => downloadAttachment(attachment)}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteAttachment(attachment.id, attachment.file_path)}
            >
              <Trash className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
