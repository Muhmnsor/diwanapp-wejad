
import { Button } from "@/components/ui/button";
import { MessageCircle, Download } from "lucide-react";

interface TaskAttachment {
  id: string;
  file_name: string;
  file_url: string;
  created_at: string;
  created_by: string;
}

interface TaskActionsProps {
  onShowDiscussion: () => void;
  assigneeAttachment: TaskAttachment | null;
  onDownload: (fileUrl: string, fileName: string) => void;
}

export const TaskActions = ({ 
  onShowDiscussion, 
  assigneeAttachment, 
  onDownload 
}: TaskActionsProps) => {
  return (
    <div className="flex items-center gap-1">
      <Button 
        variant="ghost" 
        size="sm" 
        className="p-0 h-7 w-7"
        onClick={(e) => {
          e.stopPropagation();
          onShowDiscussion();
        }}
        title="مناقشة المهمة"
      >
        <MessageCircle className="h-4 w-4 text-muted-foreground hover:text-foreground" />
      </Button>
      
      {assigneeAttachment && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-0 h-7 w-7"
          onClick={(e) => {
            e.stopPropagation();
            onDownload(assigneeAttachment.file_url, assigneeAttachment.file_name);
          }}
          title="تنزيل مرفق المكلف"
        >
          <Download className="h-4 w-4 text-blue-500 hover:text-blue-700" />
        </Button>
      )}
    </div>
  );
};
