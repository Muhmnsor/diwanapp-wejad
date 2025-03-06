
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Paperclip, Download, FileText, FileImage, File } from "lucide-react";

interface AttachmentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: string;
}

export const AttachmentsDialog = ({
  open,
  onOpenChange,
  taskId,
}: AttachmentsDialogProps) => {
  const [attachments, setAttachments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (open) {
      fetchAttachments();
    }
  }, [open, taskId]);

  const fetchAttachments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("unified_task_attachments")
        .select("*, profiles:created_by(display_name, email)")
        .eq("task_id", taskId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAttachments(data || []);
    } catch (error) {
      console.error("Error fetching attachments:", error);
      toast.error("حدث خطأ أثناء تحميل المرفقات");
    } finally {
      setIsLoading(false);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (!fileType) return <File className="h-5 w-5 text-gray-500" />;

    if (fileType.includes("image")) {
      return <FileImage className="h-5 w-5 text-blue-500" />;
    } else if (fileType.includes("pdf")) {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else if (fileType.includes("word") || fileType.includes("document")) {
      return <FileText className="h-5 w-5 text-blue-700" />;
    } else if (fileType.includes("excel") || fileType.includes("spreadsheet")) {
      return <FileText className="h-5 w-5 text-green-700" />;
    } else {
      return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>مرفقات المهمة</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto py-4">
          {isLoading ? (
            <div className="text-center py-4">جاري تحميل المرفقات...</div>
          ) : attachments.length === 0 ? (
            <div className="text-center py-4 text-gray-500">لا توجد مرفقات حاليًا</div>
          ) : (
            <div className="space-y-2">
              {attachments.map((attachment) => (
                <div key={attachment.id} className="border rounded-lg p-3 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    {getFileIcon(attachment.file_type)}
                    <div>
                      <div className="font-medium">{attachment.file_name}</div>
                      <div className="text-xs text-gray-500 flex flex-wrap gap-3">
                        <span>
                          تم الرفع بواسطة: {attachment.profiles?.display_name || attachment.profiles?.email || "مستخدم"}
                        </span>
                        <span>{formatDate(attachment.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  <a
                    href={attachment.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                  >
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-1" />
                      تنزيل
                    </Button>
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
