
import { useState, useEffect } from "react";
import { Task } from "../../types/task";
import { TaskDiscussionDialog } from "../TaskDiscussionDialog";
import { TaskAttachmentDialog } from "../dialogs/TaskAttachmentDialog";
import { FileUploadDialog } from "../dialogs/FileUploadDialog";
import { TaskTemplatesDialog } from "../dialogs/TaskTemplatesDialog";
import { EditTaskDialog } from "../../project-details/EditTaskDialog";
import { TaskDependenciesDialog } from "../../project-details/components/dependencies/TaskDependenciesDialog";
import type { Task as ProjectTask } from "../../project-details/types/task";

interface TaskDialogsProviderProps {
  task: Task;
  onStatusChange: (taskId: string, status: string) => void;
  onTaskUpdated?: () => void;
  initialDialog?: "discussion" | "attachments" | "upload" | "templates" | "edit" | "dependencies";
}

export const TaskDialogsProvider = ({ 
  task, 
  onStatusChange, 
  onTaskUpdated,
  initialDialog 
}: TaskDialogsProviderProps) => {
  const [showDiscussion, setShowDiscussion] = useState(initialDialog === "discussion");
  const [isAttachmentDialogOpen, setIsAttachmentDialogOpen] = useState(initialDialog === "attachments");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(initialDialog === "upload");
  const [isTemplatesDialogOpen, setIsTemplatesDialogOpen] = useState(initialDialog === "templates");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(initialDialog === "edit");
  const [showDependencies, setShowDependencies] = useState(initialDialog === "dependencies");

  // Update dialog state when the task changes
  useEffect(() => {
    if (initialDialog === "discussion") {
      setShowDiscussion(true);
    }
  }, [task.id, initialDialog]);

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
          onTaskUpdated={onTaskUpdated}
        />
      )}
    </>
  );
};
