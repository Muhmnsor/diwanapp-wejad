
import { Task } from "../../types/task";
import { TaskDiscussionDialog } from "../TaskDiscussionDialog";
import { TaskAttachmentDialog } from "./TaskAttachmentDialog";
import { FileUploadDialog } from "./FileUploadDialog";
import { TaskTemplatesDialog } from "./TaskTemplatesDialog";
import { EditTaskDialog } from "../../project-details/EditTaskDialog";
import { TaskDependenciesDialog } from "../../project-details/components/dependencies/TaskDependenciesDialog";
import type { Task as ProjectTask } from "../../project-details/types/task";

interface TaskDialogsProps {
  task: Task;
  showDiscussion: boolean;
  setShowDiscussion: (show: boolean) => void;
  isAttachmentDialogOpen: boolean;
  setIsAttachmentDialogOpen: (open: boolean) => void;
  isUploadDialogOpen: boolean;
  setIsUploadDialogOpen: (open: boolean) => void;
  isTemplatesDialogOpen: boolean;
  setIsTemplatesDialogOpen: (open: boolean) => void;
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: (open: boolean) => void;
  showDependencies: boolean;
  setShowDependencies: (show: boolean) => void;
  onStatusChange: (taskId: string, status: string) => void;
  onTaskUpdated?: () => void;
}

export const TaskDialogs = ({
  task,
  showDiscussion,
  setShowDiscussion,
  isAttachmentDialogOpen,
  setIsAttachmentDialogOpen,
  isUploadDialogOpen,
  setIsUploadDialogOpen,
  isTemplatesDialogOpen,
  setIsTemplatesDialogOpen,
  isEditDialogOpen,
  setIsEditDialogOpen,
  showDependencies,
  setShowDependencies,
  onStatusChange,
  onTaskUpdated
}: TaskDialogsProps) => {
  
  const adaptTaskForEditDialog = (): ProjectTask => {
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

  const handleTaskUpdated = () => {
    if (onTaskUpdated) {
      onTaskUpdated();
    }
  };

  return (
    <>
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
          onTaskUpdated={handleTaskUpdated}
        />
      )}
    </>
  );
};
