
import { useState } from "react";
import { 
  MessageCircle,
  Check,
  Clock,
  CalendarClock,
  XCircle,
  Paperclip,
  Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Task } from "../types/task";
import { TaskDiscussionDialog } from "./TaskDiscussionDialog";
import { TaskHeader } from "./header/TaskHeader";
import { TaskMetadata } from "./metadata/TaskMetadata";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { uploadAttachment } from "../services/uploadService";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface TaskListItemProps {
  task: Task;
  onStatusChange: (taskId: string, status: string) => void;
  onDelete?: (taskId: string) => void;
}

export const TaskListItem = ({ task, onStatusChange, onDelete }: TaskListItemProps) => {
  const [showDiscussion, setShowDiscussion] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showAttachmentDialog, setShowAttachmentDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const currentStatus = task.status || "pending";

  // Custom function to handle status change
  const handleStatusChange = async (status: string) => {
    setIsUpdating(true);
    try {
      // Check if the task is a subtask and use the correct table
      if (task.is_subtask) {
        const { error } = await supabase
          .from('subtasks')
          .update({ status })
          .eq('id', task.id);
          
        if (error) throw error;
        
        // We need to call the onStatusChange to update the UI
        onStatusChange(task.id, status);
        toast.success('تم تحديث حالة المهمة الفرعية');
      } else {
        // Regular tasks use the parent component's handler
        onStatusChange(task.id, status);
      }
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error('حدث خطأ أثناء تحديث حالة المهمة');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <Check className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-amber-500" />;
      case "delayed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <CalendarClock className="h-4 w-4 text-blue-500" />;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
  };

  const handleUploadAttachment = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    try {
      // Upload the file
      const uploadResult = await uploadAttachment(selectedFile);
      
      if (!uploadResult || uploadResult.error) {
        throw new Error("فشل رفع الملف");
      }
      
      // Add attachment record to database
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;
      
      const attachmentData = {
        task_id: task.id,
        name: selectedFile.name,
        url: uploadResult.url,
        content_type: selectedFile.type,
        size: selectedFile.size,
        created_by: userId,
      };
      
      const { error } = await supabase
        .from('task_attachments')
        .insert(attachmentData);
        
      if (error) throw error;
      
      // Show success notification
      toast.success('تم رفع المرفق بنجاح');
      
      // Close dialog and reset state
      setSelectedFile(null);
      setShowAttachmentDialog(false);
    } catch (error) {
      console.error("Error uploading attachment:", error);
      toast.error('حدث خطأ أثناء رفع المرفق');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-card hover:bg-accent/5 border rounded-lg p-4 transition-colors">
      <TaskHeader task={task} status={currentStatus} />
      
      <div className="mt-3">
        <TaskMetadata
          dueDate={task.due_date}
          projectName={task.project_name}
          isSubtask={!!task.parent_task_id}
          parentTaskId={task.parent_task_id}
        />
      </div>
      
      <div className="flex justify-between items-center mt-3 pt-3 border-t">
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground"
            onClick={() => setShowDiscussion(true)}
          >
            <MessageCircle className="h-3.5 w-3.5" />
            مناقشة
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground"
            onClick={() => setShowAttachmentDialog(true)}
          >
            <Upload className="h-3.5 w-3.5" />
            رفع ملف
          </Button>
        </div>
        
        <div className="flex gap-2">
          {currentStatus !== "completed" ? (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs flex items-center gap-1"
              onClick={() => handleStatusChange("completed")}
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
              onClick={() => handleStatusChange("pending")}
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
              onClick={() => onDelete(task.id)}
            >
              <XCircle className="h-3.5 w-3.5" />
              حذف
            </Button>
          )}
        </div>
      </div>
      
      {/* Task Discussion Dialog */}
      <TaskDiscussionDialog 
        open={showDiscussion} 
        onOpenChange={setShowDiscussion}
        task={task}
      />
      
      {/* Attachment Upload Dialog */}
      <Dialog open={showAttachmentDialog} onOpenChange={setShowAttachmentDialog}>
        <DialogContent className="sm:max-w-[450px]" dir="rtl">
          <DialogHeader>
            <DialogTitle>إرفاق ملف</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              {selectedFile ? (
                <div className="flex items-center justify-between p-2 border rounded-md">
                  <span className="text-sm truncate max-w-[250px]">{selectedFile.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleFileRemove}
                    className="h-8 w-8 p-0"
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-md">
                  <Paperclip className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">اسحب الملف هنا أو اضغط لاختيار ملف</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('attachment-upload')?.click()}
                  >
                    اختيار ملف
                  </Button>
                  <Input
                    id="attachment-upload"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowAttachmentDialog(false)}
              >
                إلغاء
              </Button>
              <Button
                onClick={handleUploadAttachment}
                disabled={!selectedFile || isUploading}
              >
                {isUploading ? 'جاري الرفع...' : 'رفع الملف'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
