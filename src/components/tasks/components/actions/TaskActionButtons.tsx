
import { MessageCircle, Upload, Paperclip, Check, Clock, XCircle, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TaskActionButtonsProps {
  currentStatus: string;
  isUpdating: boolean;
  onShowDiscussion: () => void;
  onOpenFileUploader: () => void;
  onOpenAttachments: () => void;
  onStatusChange: (status: string) => void;
  onDownloadTemplate?: () => void; // New prop for downloading template
  onDelete?: (taskId: string) => void;
  taskId: string;
  hasTemplate?: boolean; // To check if the task has a template
}

export const TaskActionButtons = ({
  currentStatus,
  isUpdating,
  onShowDiscussion,
  onOpenFileUploader,
  onOpenAttachments,
  onStatusChange,
  onDownloadTemplate,
  onDelete,
  taskId,
  hasTemplate = false // Default to false if not provided
}: TaskActionButtonsProps) => {
  return (
    <div className="flex justify-between items-center mt-3 pt-3 border-t">
      <div className="flex gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground"
          onClick={onShowDiscussion}
        >
          <MessageCircle className="h-3.5 w-3.5" />
          مناقشة
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground"
          onClick={onOpenFileUploader}
        >
          <Upload className="h-3.5 w-3.5" />
          رفع ملف
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground"
          onClick={onOpenAttachments}
        >
          <Paperclip className="h-3.5 w-3.5" />
          المستلمات
        </Button>

        {hasTemplate && onDownloadTemplate && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground"
            onClick={onDownloadTemplate}
          >
            <FileDown className="h-3.5 w-3.5" />
            نماذج المهمة
          </Button>
        )}
      </div>
      
      <div className="flex gap-2">
        {currentStatus !== "completed" ? (
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs flex items-center gap-1"
            onClick={() => onStatusChange("completed")}
            disabled={isUpdating}
          >
            <Check className="h-3.5 w-3.5 text-green-500" />
            تمت
          </Button>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs flex items-center gap-1"
            onClick={() => onStatusChange("pending")}
            disabled={isUpdating}
          >
            <Clock className="h-3.5 w-3.5 text-amber-500" />
            قيد التنفيذ
          </Button>
        )}
        
        {onDelete && (
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs flex items-center gap-1 text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={() => onDelete(taskId)}
          >
            <XCircle className="h-3.5 w-3.5" />
            حذف
          </Button>
        )}
      </div>
    </div>
  );
};
