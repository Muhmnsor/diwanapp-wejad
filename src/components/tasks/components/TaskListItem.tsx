
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
import { useTaskAssignmentNotifications } from "@/hooks/useTaskAssignmentNotifications";
import { useAuthStore } from "@/store/authStore";
import { EditTaskDialog } from "../project-details/EditTaskDialog";
import type { Task as ProjectTask } from "../project-details/types/task";
import { useTaskPermissions } from "../hooks/useTaskPermissions";

interface TaskListItemProps {
  task: Task;
  onStatusChange: (taskId: string, status: string) => void;
  onDelete?: (taskId: string) => void;
  onTaskUpdated?: () => void;
}

export const TaskListItem = ({ task, onStatusChange, onDelete, onTaskUpdated }: TaskListItemProps) => {
  const [showDiscussion, setShowDiscussion] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAttachmentDialogOpen, setIsAttachmentDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isTemplatesDialogOpen, setIsTemplatesDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const currentStatus = task.status || "pending";
  const { sendTaskStatusUpdateNotification } = useTaskNotifications();
  const { sendTaskAssignmentNotification } = useTaskAssignmentNotifications();
  const { user } = useAuthStore();
  
  const { canEdit, canDelete, canChangeStatus } = useTaskPermissions({
    taskId: task.id,
    assignedTo: task.assigned_to,
    createdBy: task.created_by
  });

  // Custom function to handle status change
  const handleStatusChange = async (status: string) => {
    if (!canChangeStatus) {
      toast.error('ليس لديك صلاحية لتغيير حالة هذه المهمة');
      return;
    }
    
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
          const userData = await supabase.auth.getUser(user?.id || '');
          const userName = userData.data?.user?.email || 'مستخدم';
          
          await sendTaskStatusUpdateNotification({
            taskId: task.id,
            taskTitle: task.title,
            assignedUserId: task.assigned_to,
            updatedByUserId: user?.id,
            updatedByUserName: userName
          }, status);
        }
      } else {
        // Regular tasks use the parent component's handler
        onStatusChange(task.id, status);
        
        // Send notification if there's an assigned user
        if (task.assigned_to && task.assigned_to !== user?.id) {
          const userData = await supabase.auth.getUser(user?.id || '');
          const userName = userData.data?.user?.email || 'مستخدم';
          
          await sendTaskStatusUpdateNotification({
            taskId: task.id,
            taskTitle: task.title,
            projectId: task.project_id,
            projectTitle: task.project_name,
            assignedUserId: task.assigned_to,
            updatedByUserId: user?.id,
            updatedByUserName: userName
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

  // Handle edit task
  const handleEditTask = (taskId: string) => {
    if (!canEdit) {
      toast.error('ليس لديك صلاحية لتعديل هذه المهمة');
      return;
    }
    setIsEditDialogOpen(true);
  };
  
  // Handle delete task
  const handleDeleteTask = (taskId: string) => {
    if (!canDelete) {
      toast.error('ليس لديك صلاحية لحذف هذه المهمة');
      return;
    }
    
    if (onDelete) {
      onDelete(taskId);
    }
  };

  // Handle task update completion
  const handleTaskUpdated = () => {
    if (onTaskUpdated) {
      onTaskUpdated();
    }
  };

  // Convert to the ProjectTask type for EditTaskDialog
  const adaptTaskForEditDialog = (): ProjectTask => {
    return {
      ...task,
      description: task.description || null, // Ensure description is never undefined
      status: task.status || "pending",
      priority: task.priority || null,
      due_date: task.due_date || null,
      assigned_to: task.assigned_to || null,
      created_at: task.created_at || new Date().toISOString(),
      stage_id: task.stage_id || null
    };
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
          isGeneral={task.is_general}
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
        onDelete={handleDeleteTask}
        onEdit={handleEditTask}
        taskId={task.id}
        isGeneral={task.is_general}
        canEdit={canEdit}
        canDelete={canDelete}
        canChangeStatus={canChangeStatus}
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

      {/* Edit Task Dialog for General Tasks */}
      {task && task.is_general && (
        <EditTaskDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          task={adaptTaskForEditDialog()}
          projectStages={[]}
          projectMembers={[]}
          onTaskUpdated={handleTaskUpdated}
        />
      )}
    </div>
  );
};
