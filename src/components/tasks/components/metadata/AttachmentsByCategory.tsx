
import { FileIcon, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Attachment {
  id: string;
  file_name: string;
  file_url: string;
  file_type?: string | null;
}

interface AttachmentsByCategoryProps {
  title: string;
  attachments: Attachment[];
  bgColor: string;
  iconColor: string;
  onDownload: (fileUrl: string, fileName: string) => void;
}

export const AttachmentsByCategory = ({
  title,
  attachments,
  bgColor,
  iconColor,
  onDownload
}: AttachmentsByCategoryProps) => {
  if (attachments.length === 0) return null;
  
  return (
    <div className="w-full mt-2">
      <div className="text-sm font-medium mb-1">{title}</div>
      <div className="space-y-1">
        {attachments.map((attachment) => (
          <div key={attachment.id} className={`flex items-center ${bgColor} rounded p-1.5 text-sm`}>
            <FileIcon className={`h-4 w-4 ${iconColor} ml-2 flex-shrink-0`} />
            <span className="flex-1 truncate">{attachment.file_name}</span>
            <Button 
              variant="ghost" 
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => onDownload(attachment.file_url, attachment.file_name)}
              title="تنزيل الملف"
            >
              <Download className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
