
import { FileIcon, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Attachment } from "../../hooks/useAttachmentOperations";

interface AttachmentItemProps {
  attachment: Attachment;
  showCategory?: boolean;
  canDelete?: boolean;
  isDeleting?: boolean;
  onDelete: (id: string) => Promise<void>;
  onDownload: (fileUrl: string, fileName: string) => void;
}

export const AttachmentItem = ({
  attachment,
  showCategory = true,
  canDelete = false,
  isDeleting = false,
  onDelete,
  onDownload
}: AttachmentItemProps) => {
  const getFileTypeColor = () => {
    const fileType = attachment.file_type?.split('/')[0] || '';
    
    switch (fileType) {
      case 'image':
        return 'bg-blue-50 text-blue-500';
      case 'application':
        return 'bg-amber-50 text-amber-500';
      case 'text':
        return 'bg-green-50 text-green-500';
      default:
        return 'bg-gray-50 text-gray-500';
    }
  };
  
  const bgColorClass = getFileTypeColor();
  
  return (
    <div className={`flex items-center ${bgColorClass.split(' ')[0]} rounded p-2 text-sm`}>
      <FileIcon className={`h-4 w-4 ${bgColorClass.split(' ')[1]} ml-2 flex-shrink-0`} />
      <div className="flex-1 min-w-0">
        <div className="truncate">{attachment.file_name}</div>
        {showCategory && attachment.attachment_category && (
          <div className="text-xs text-gray-500">{attachment.attachment_category}</div>
        )}
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <Button 
          variant="ghost" 
          size="sm"
          className="h-6 w-6 p-0"
          onClick={() => onDownload(attachment.file_url, attachment.file_name)}
          title="تنزيل الملف"
        >
          <Download className="h-3.5 w-3.5" />
        </Button>
        
        {canDelete && (
          <Button 
            variant="ghost" 
            size="sm"
            className="h-6 w-6 p-0 text-destructive"
            onClick={() => onDelete(attachment.id)}
            disabled={isDeleting}
            title="حذف الملف"
          >
            {isDeleting ? (
              <span className="h-3.5 w-3.5 animate-spin">⏳</span>
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
};
