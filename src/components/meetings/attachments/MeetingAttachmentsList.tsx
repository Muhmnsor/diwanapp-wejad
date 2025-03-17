
import { useState } from "react";
import { useMeetingAttachments } from "@/hooks/meetings/useMeetingAttachments";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, FileUp, Download, X, File } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ar } from "date-fns/locale";

interface MeetingAttachmentsListProps {
  meetingId?: string;
}

export const MeetingAttachmentsList = ({ meetingId }: MeetingAttachmentsListProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { 
    data: attachments = [], 
    isLoading, 
    error,
    refetch 
  } = useMeetingAttachments(meetingId);
  
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };
  
  const getFileIcon = (fileType: string) => {
    if (fileType.includes('image')) return <File className="h-8 w-8 text-blue-500" />;
    if (fileType.includes('pdf')) return <File className="h-8 w-8 text-red-500" />;
    if (fileType.includes('word') || fileType.includes('document')) return <File className="h-8 w-8 text-blue-600" />;
    if (fileType.includes('excel') || fileType.includes('sheet')) return <File className="h-8 w-8 text-green-600" />;
    if (fileType.includes('presentation') || fileType.includes('powerpoint')) return <File className="h-8 w-8 text-orange-500" />;
    return <File className="h-8 w-8 text-gray-500" />;
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <span>جاري تحميل المرفقات...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>خطأ</AlertTitle>
        <AlertDescription>
          حدث خطأ أثناء تحميل المرفقات: {error.message}
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">المرفقات ({attachments.length})</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <FileUp className="mr-2 h-4 w-4" />
          رفع ملف
        </Button>
      </div>
      
      {attachments.length === 0 ? (
        <div className="text-center py-12 bg-muted/20 rounded-lg border">
          <p className="text-muted-foreground">لا توجد مرفقات لهذا الاجتماع</p>
          <Button variant="outline" className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            رفع ملف جديد
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {attachments.map((attachment) => (
            <div 
              key={attachment.id} 
              className="border rounded-lg p-4 flex flex-col"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  {getFileIcon(attachment.file_type)}
                  <div className="ml-3">
                    <h3 className="font-medium text-sm">{attachment.file_name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatFileSize(attachment.file_size)}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-destructive h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="text-xs text-muted-foreground mb-4">
                تم الرفع في {format(parseISO(attachment.created_at), 'd MMM yyyy', { locale: ar })}
              </div>
              
              <div className="mt-auto">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => window.open(attachment.file_path, '_blank')}
                >
                  <Download className="mr-2 h-4 w-4" />
                  تنزيل
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* File upload dialog will be implemented later */}
    </div>
  );
};
