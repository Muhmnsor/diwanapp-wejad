import React from 'react';
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface Attachment {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
  uploaded_by: string;
  is_main_document?: boolean;
}

interface AttachmentsGalleryProps {
  attachments: Attachment[];
  onDownload: (attachment: Attachment) => void;
}

export const AttachmentsGallery: React.FC<AttachmentsGalleryProps> = ({ 
  attachments,
  onDownload
}) => {
  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      return format(new Date(dateStr), 'dd MMM yyyy - HH:mm', { locale: ar });
    } catch {
      return dateStr;
    }
  };

  if (attachments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        لا توجد مرفقات لهذه المعاملة
      </div>
    );
  }

  // Separate main document from other attachments
  const mainDocuments = attachments.filter(att => att.is_main_document);
  const otherAttachments = attachments.filter(att => !att.is_main_document);

  return (
    <div className="space-y-4">
      {/* Main document section */}
      {mainDocuments.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium mb-2">المستند الرئيسي</h4>
          <div className="space-y-2">
            {mainDocuments.map((attachment) => (
              <div 
                key={attachment.id} 
                className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-md"
              >
                <div className="flex items-center">
                  <FileText className="h-5 w-5 ml-2 text-blue-600" />
                  <div>
                    <p className="font-medium">{attachment.file_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(attachment.file_size / 1024).toFixed(2)} كيلوبايت • تم الرفع {formatDateTime(attachment.uploaded_at)}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onDownload(attachment)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Other attachments */}
      {otherAttachments.length > 0 && (
        <>
          <h4 className="font-medium mb-2">المرفقات</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {otherAttachments.map((attachment) => (
              <div 
                key={attachment.id}
                className="flex items-center justify-between p-3 bg-gray-50 border rounded-md"
              >
                <div className="flex items-center overflow-hidden">
                  <FileText className="h-5 w-5 ml-2 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{attachment.file_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(attachment.file_size / 1024).toFixed(2)} كيلوبايت
                    </p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onDownload(attachment)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
