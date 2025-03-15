
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileIcon, Download, FileX, File } from "lucide-react";

interface Attachment {
  id: string;
  file_name: string;
  file_path: string;
  file_type?: string;
  file_size?: number;
  uploaded_by?: {
    id: string;
    display_name?: string;
    email?: string;
  };
  created_at: string;
}

interface AttachmentsListProps {
  attachments: Attachment[];
}

export const AttachmentsList = ({ attachments }: AttachmentsListProps) => {
  if (!attachments || attachments.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/20 rounded-lg">
        <FileX className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <h3 className="font-medium text-lg">لا توجد مرفقات</h3>
        <p className="text-muted-foreground">لم يتم إضافة أي مرفقات لهذا الطلب</p>
      </div>
    );
  }

  // Format file size to human readable format
  const formatFileSize = (size?: number) => {
    if (!size) return "غير معروف";
    
    const kb = size / 1024;
    if (kb < 1024) {
      return `${Math.round(kb * 10) / 10} KB`;
    }
    
    const mb = kb / 1024;
    return `${Math.round(mb * 10) / 10} MB`;
  };

  // Determine file icon based on mime type
  const getFileIcon = (fileType?: string) => {
    if (!fileType) return <File className="h-5 w-5" />;
    
    if (fileType.includes("image")) {
      return <FileIcon className="h-5 w-5 text-blue-500" />;
    } else if (fileType.includes("pdf")) {
      return <FileIcon className="h-5 w-5 text-red-500" />;
    } else if (fileType.includes("word") || fileType.includes("document")) {
      return <FileIcon className="h-5 w-5 text-blue-700" />;
    } else if (fileType.includes("excel") || fileType.includes("sheet")) {
      return <FileIcon className="h-5 w-5 text-green-600" />;
    }
    
    return <FileIcon className="h-5 w-5 text-gray-500" />;
  };

  const handleDownload = (filePath: string, fileName: string) => {
    // For public files, create a direct download link
    const downloadLink = filePath.startsWith('http') 
      ? filePath 
      : `${filePath}`;
    
    // Create a temporary anchor element to trigger the download
    const a = document.createElement('a');
    a.href = downloadLink;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-4">
      {attachments.map((attachment) => (
        <Card key={attachment.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="bg-muted p-3 rounded-lg">
                  {getFileIcon(attachment.file_type)}
                </div>
                <div>
                  <h4 className="font-medium truncate max-w-[200px] md:max-w-[300px]">
                    {attachment.file_name}
                  </h4>
                  <div className="flex gap-x-3 text-sm text-muted-foreground">
                    <span>{formatFileSize(attachment.file_size)}</span>
                    {attachment.uploaded_by?.display_name && (
                      <span>بواسطة: {attachment.uploaded_by.display_name}</span>
                    )}
                  </div>
                </div>
              </div>
              
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => handleDownload(attachment.file_path, attachment.file_name)}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
