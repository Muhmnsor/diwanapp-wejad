
import { FileIcon, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Attachment {
  id: string;
  file_name: string;
  file_url: string;
  file_type?: string | null;
  status?: string; // إضافة حقل الحالة للمستلمات
}

interface AttachmentsByCategoryProps {
  title: string;
  attachments: Attachment[];
  bgColor: string;
  iconColor: string;
  onDownload: (fileUrl: string, fileName: string) => void;
  onDelete?: (attachmentId: string) => Promise<boolean>;
  isDeleting?: Record<string, boolean>;
  canDelete?: boolean;
  showStatus?: boolean; // إضافة خاصية لإظهار حالة المستلمات
}

export const AttachmentsByCategory = ({
  title,
  attachments,
  bgColor,
  iconColor,
  onDownload,
  onDelete,
  isDeleting = {},
  canDelete = false,
  showStatus = false
}: AttachmentsByCategoryProps) => {
  if (attachments.length === 0) return (
    <div className="w-full mt-2">
      <div className="text-sm font-medium mb-1">{title}</div>
      <div className="text-sm text-gray-500">لا توجد عناصر لعرضها</div>
    </div>
  );
  
  // وظيفة لتحديد لون وقيمة عرض حالة المستلم
  const getStatusDisplay = (status?: string) => {
    if (!status) return null;
    
    let bgColor = 'bg-yellow-100 text-yellow-800';
    let text = 'قيد المراجعة';
    
    if (status === 'approved') {
      bgColor = 'bg-green-100 text-green-800';
      text = 'تم القبول';
    } else if (status === 'rejected') {
      bgColor = 'bg-red-100 text-red-800';
      text = 'مرفوض';
    }
    
    return { bgColor, text };
  };
  
  return (
    <div className="w-full mt-2">
      <div className="text-sm font-medium mb-1">{title}</div>
      <div className="space-y-1">
        {attachments.map((attachment) => (
          <div key={attachment.id} className={`flex items-center ${bgColor} rounded p-1.5 text-sm`}>
            <FileIcon className={`h-4 w-4 ${iconColor} ml-2 flex-shrink-0`} />
            <span className="flex-1 truncate">{attachment.file_name}</span>
            
            {/* إظهار حالة المستلم إذا كانت الخاصية showStatus مفعلة */}
            {showStatus && attachment.status && (
              <div className="mr-2">
                <span className={`text-xs px-1.5 py-0.5 rounded ${getStatusDisplay(attachment.status)?.bgColor}`}>
                  {getStatusDisplay(attachment.status)?.text}
                </span>
              </div>
            )}
            
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => onDownload(attachment.file_url, attachment.file_name)}
                title="تنزيل الملف"
              >
                <Download className="h-3.5 w-3.5" />
              </Button>
              
              {canDelete && onDelete && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-6 w-6 p-0 text-destructive"
                  onClick={() => onDelete(attachment.id)}
                  disabled={isDeleting[attachment.id]}
                  title="حذف الملف"
                >
                  {isDeleting[attachment.id] ? (
                    <span className="h-3.5 w-3.5 animate-spin">⏳</span>
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
