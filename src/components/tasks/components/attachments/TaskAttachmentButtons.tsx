
import { Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Task } from "../../project-details/types/task";
import { useAttachmentOperations } from "../../hooks/useAttachmentOperations";
import { useState } from "react";
import { TaskAttachmentDialog } from "../dialogs/TaskAttachmentDialog";

interface TaskAttachmentButtonsProps {
  task: Task;
  className?: string;
}

export const TaskAttachmentButtons = ({ task, className = "" }: TaskAttachmentButtonsProps) => {
  const [showAttachments, setShowAttachments] = useState(false);
  const { uploadAttachment, isUploading } = useAttachmentOperations();
  const fileInputId = `file-upload-${task.id}`;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    await uploadAttachment(file, task.id);
    
    // Reset input
    if (e.target) {
      e.target.value = '';
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Upload Button */}
      <div className="relative">
        <input
          type="file"
          id={fileInputId}
          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          onChange={handleFileChange}
          disabled={isUploading}
        />
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground"
          disabled={isUploading}
        >
          <Upload className="h-3.5 w-3.5" />
          {isUploading ? "جاري الرفع..." : "رفع ملف"}
        </Button>
      </div>
      
      {/* Attachments Button */}
      <Button 
        variant="ghost" 
        size="sm" 
        className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground"
        onClick={() => setShowAttachments(true)}
      >
        <FileText className="h-3.5 w-3.5" />
        المرفقات
      </Button>

      {/* Task Attachment Dialog */}
      <TaskAttachmentDialog
        task={task}
        open={showAttachments}
        onOpenChange={setShowAttachments}
      />
    </div>
  );
};
