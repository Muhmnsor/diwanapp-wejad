
import React from "react";
import { FileText, Download, Eye } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Button } from "@/components/ui/button";

interface Attachment {
  id: string;
  filename: string;
  file_size?: number;
  content_type?: string;
  created_at: string;
  uploaded_by?: string;
  url?: string;
}

interface AttachmentsListProps {
  attachments: Attachment[];
}

export const AttachmentsList: React.FC<AttachmentsListProps> = ({ attachments }) => {
  if (!attachments || attachments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground" dir="rtl">
        لا توجد مرفقات لهذا الطلب
      </div>
    );
  }

  const formatFileSize = (size?: number) => {
    if (!size) return "غير معروف";
    const kb = size / 1024;
    if (kb < 1024) {
      return `${kb.toFixed(2)} KB`;
    } else {
      return `${(kb / 1024).toFixed(2)} MB`;
    }
  };

  const handleDownload = (attachment: Attachment) => {
    if (attachment.url) {
      window.open(attachment.url, "_blank");
    }
  };

  const handlePreview = (attachment: Attachment) => {
    if (attachment.url) {
      window.open(attachment.url, "_blank");
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      {attachments.map((attachment) => (
        <div
          key={attachment.id}
          className="flex items-center justify-between border rounded-md p-3 bg-card"
        >
          <div className="flex items-center">
            <div className="p-2 bg-primary/10 rounded-md ml-3">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="font-medium">{attachment.filename}</div>
              <div className="text-xs text-muted-foreground">
                <span>{formatFileSize(attachment.file_size)}</span>
                <span className="mx-2">•</span>
                <span>
                  {format(new Date(attachment.created_at), "P", { locale: ar })}
                </span>
              </div>
            </div>
          </div>
          <div className="flex space-x-2 space-x-reverse">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePreview(attachment)}
              title="معاينة"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDownload(attachment)}
              title="تنزيل"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
