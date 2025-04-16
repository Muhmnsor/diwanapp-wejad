import { useState } from "react";
import { Task } from "../types/task";
import { TaskHeader } from "./header/TaskHeader";
import { TaskMetadata } from "./metadata/TaskMetadata";
import { TaskActionButtons } from "./actions/TaskActionButtons";
import { useTaskStatusManager } from "./status/TaskStatusManager";
import { useTaskDependencyManager } from "./dependencies/TaskDependencyManager";
import { TaskDiscussionDialog } from "./TaskDiscussionDialog";
import { TaskAttachmentDialog } from "./dialogs/TaskAttachmentDialog";
import { FileUploadDialog } from "./dialogs/FileUploadDialog";
import { TaskTemplatesDialog } from "./dialogs/TaskTemplatesDialog";
import { EditTaskDialog } from "../project-details/EditTaskDialog";
import { TaskDependenciesDialog } from "../project-details/components/dependencies/TaskDependenciesDialog";
import { useAuthStore } from "@/store/authStore";


interface TaskListItemProps {
  task: Task;
  onStatusChange: (taskId: string, status: string) => void;
  onDelete?: (taskId: string) => void;
  onTaskUpdated?: () => void;
}

export const TaskListItem = ({ task, onStatusChange, onDelete, onTaskUpdated }: TaskListItemProps) => {
  const [showDiscussion, setShowDiscussion] = useState(false);
  const [isAttachmentDialogOpen, setIsAttachmentDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isTemplatesDialogOpen, setIsTemplatesDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const currentStatus = task.status || "pending";
  
  const {
    showDependencies,
    setShowDependencies,
    hasDependencies,
    dependencyIconColor
  } = useTaskDependencyManager({ taskId: task.id });
  
  const { isUpdating, handleStatusChange } = useTaskStatusManager({
    taskId: task.id,
    isSubtask: !!task.parent_task_id,
    currentStatus,
    dueDate: task.due_date,
    assignedTo: task.assigned_to,
    projectId: task.project_id,
    projectTitle: task.project_name,
    taskTitle: task.title,
    onStatusChange
  });

  const handleEditTask = (taskId: string) => {
    setIsEditDialogOpen(true);
  };
  
  const adaptTaskForEditDialog = () => {
    return {
      ...task,
      description: task.description || null,
      status: task.status || "pending",
      priority: task.priority || null,
      due_date: task.due_date || null,
      assigned_to: task.assigned_to || null,
      created_at: task.created_at || new Date().toISOString(),
      stage_id: task.stage_id || null
    };
  };

  return (
    <div className={`bg-card hover:bg-accent/5 border rounded-lg p-4 transition-colors ${task.is_general ? 'bg-gradient-to-br from-[#f1f5fd] to-[#f5f9ff]' : ''}`}>
      <div className="flex justify-between items-start">
        <TaskHeader 
          task={task} 
          status={currentStatus} 
          onShowDependencies={() => setShowDependencies(true)}
          hasDependencies={hasDependencies}
          dependencyIconColor={dependencyIconColor}
        />
      </div>
      
      <div className="mt-3">
        <TaskMetadata
          dueDate={task.due_date}
          projectName={task.project_name}
          isSubtask={!!task.parent_task_id}
          parentTaskId={task.parent_task_id}
          isGeneral={task.is_general}
          requiresDeliverable={task.requires_deliverable}
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
        onEdit={handleEditTask}
        taskId={task.id}
        isGeneral={task.is_general}
        requiresDeliverable={task.requires_deliverable}
      />
      
      <TaskDiscussionDialog 
        open={showDiscussion} 
        onOpenChange={setShowDiscussion}
        task={task}
        onStatusChange={onStatusChange}
      />
      
      <TaskDependenciesDialog
        open={showDependencies}
        onOpenChange={setShowDependencies}
        task={task}
        projectId={task.project_id || ''}
      />
      
      {task && (
        <TaskAttachmentDialog
          task={task}
          open={isAttachmentDialogOpen}
          onOpenChange={setIsAttachmentDialogOpen}
        />
      )}
      
      {task && (
        <FileUploadDialog
          isOpen={isUploadDialogOpen}
          onClose={() => setIsUploadDialogOpen(false)}
          task={task}
        />
      )}

      {task && (
        <TaskTemplatesDialog
          task={task}
          open={isTemplatesDialogOpen}
          onOpenChange={setIsTemplatesDialogOpen}
        />
      )}

      {task && task.is_general && (
        <EditTaskDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          task={adaptTaskForEditDialog()}
          projectStages={[]}
          projectMembers={[]}
          onTaskUpdated={onTaskUpdated}
        />
      )}
    </div>
  );
};
