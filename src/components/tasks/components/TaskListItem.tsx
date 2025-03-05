
import { useState } from "react";
import { Task } from "../types/task";
import { TaskHeader } from "./header/TaskHeader";
import { TaskMetadata } from "./metadata/TaskMetadata";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TaskDiscussionDialog } from "./TaskDiscussionDialog";
import { TaskAttachmentDialog } from "./dialogs/TaskAttachmentDialog";
import { FileUploadDialog } from "./dialogs/FileUploadDialog";
import { TaskActionButtons } from "./actions/TaskActionButtons";

interface TaskListItemProps {
  task: Task;
  onStatusChange: (taskId: string, status: string) => void;
  onDelete?: (taskId: string) => void;
}

export const TaskListItem = ({ task, onStatusChange, onDelete }: TaskListItemProps) => {
  const [showDiscussion, setShowDiscussion] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAttachmentDialogOpen, setIsAttachmentDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const currentStatus = task.status || "pending";
  
  // Check if task has template files (with proper optional chaining)
  const hasTemplateFiles = Boolean(
    task.attachment_url || 
    task.form_template || 
    (task.templates && task.templates.length > 0)
  );

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

  // Function to handle template download
  const handleTemplateDownload = () => {
    // Check which template field exists and use it (with proper optional chaining)
    const templateUrl = task.attachment_url || task.form_template || 
                       (task.templates && task.templates.length > 0 ? task.templates[0].url : null);
    
    if (!templateUrl) {
      toast.info('لا يوجد نموذج متاح لهذه المهمة');
      return;
    }
    
    // Create a temporary link to download the file
    const link = document.createElement('a');
    link.href = templateUrl;
    link.target = '_blank';
    link.download = `template-${task.id}.pdf`; // Default name, adjust as needed
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('جاري تنزيل نموذج المهمة');
  };

  // Check template files and log for debugging
  console.log('Task templates:', {
    hasTemplateFiles,
    attachmentUrl: task.attachment_url,
    formTemplate: task.form_template,
    templates: task.templates
  });

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
      
      <TaskActionButtons 
        currentStatus={currentStatus}
        isUpdating={isUpdating}
        onShowDiscussion={() => setShowDiscussion(true)}
        onOpenFileUploader={() => setIsUploadDialogOpen(true)}
        onOpenAttachments={() => setIsAttachmentDialogOpen(true)}
        onStatusChange={handleStatusChange}
        onDownloadTemplate={handleTemplateDownload}
        hasTemplate={hasTemplateFiles}
        onDelete={onDelete}
        taskId={task.id}
      />
      
      {/* Task Discussion Dialog */}
      <TaskDiscussionDialog 
        open={showDiscussion} 
        onOpenChange={setShowDiscussion}
        task={task}
      />
      
      {/* Attachments Dialog */}
      {task && (
        <TaskAttachmentDialog
          task={task}
          open={isAttachmentDialogOpen}
          onOpenChange={setIsAttachmentDialogOpen}
        />
      )}
      
      {/* File Upload Dialog */}
      {task && (
        <FileUploadDialog
          isOpen={isUploadDialogOpen}
          onClose={() => setIsUploadDialogOpen(false)}
          task={task}
        />
      )}
    </div>
  );
};
