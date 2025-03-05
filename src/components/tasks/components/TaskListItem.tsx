
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
import { TaskTemplatesDialog } from "./dialogs/TaskTemplatesDialog";
import { useTaskNotifications } from "@/hooks/useTaskNotifications";
import { useAuthStore } from "@/store/authStore";

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
  const [isTemplatesDialogOpen, setIsTemplatesDialogOpen] = useState(false);
  const currentStatus = task.status || "pending";
  const { sendTaskStatusUpdateNotification } = useTaskNotifications();
  const { user } = useAuthStore();

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
        
        // Send notification if there's an assigned user
        if (task.assigned_to && task.assigned_to !== user?.id) {
          await sendTaskStatusUpdateNotification({
            taskId: task.id,
            taskTitle: task.title,
            assignedUserId: task.assigned_to,
            updatedByUserId: user?.id,
            updatedByUserName: user?.user_metadata?.name || user?.email
          }, status);
        }
      } else {
        // Regular tasks use the parent component's handler
        onStatusChange(task.id, status);
        
        // Send notification if there's an assigned user
        if (task.assigned_to && task.assigned_to !== user?.id) {
          await sendTaskStatusUpdateNotification({
            taskId: task.id,
            taskTitle: task.title,
            projectId: task.project_id,
            projectTitle: task.project_name,
            assignedUserId: task.assigned_to,
            updatedByUserId: user?.id,
            updatedByUserName: user?.user_metadata?.name || user?.email
          }, status);
        }
      }
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error('حدث خطأ أثناء تحديث حالة المهمة');
    } finally {
      setIsUpdating(false);
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
      
      <TaskActionButtons 
        currentStatus={currentStatus}
        isUpdating={isUpdating}
        onShowDiscussion={() => setShowDiscussion(true)}
        onOpenFileUploader={() => setIsUploadDialogOpen(true)}
        onOpenAttachments={() => setIsAttachmentDialogOpen(true)}
        onOpenTemplates={() => setIsTemplatesDialogOpen(true)}
        onStatusChange={handleStatusChange}
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

      {/* Templates Dialog */}
      {task && (
        <TaskTemplatesDialog
          task={task}
          open={isTemplatesDialogOpen}
          onOpenChange={setIsTemplatesDialogOpen}
        />
      )}
    </div>
  );
};
