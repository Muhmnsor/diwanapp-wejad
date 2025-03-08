
import { useState } from "react";
import { Task } from "../types/task";
import { TaskHeader } from "./header/TaskHeader";
import { TaskMetadata } from "./metadata/TaskMetadata";
import { TaskActionButtons } from "./actions/TaskActionButtons";
import { TaskDialogs } from "./dialogs/TaskDialogs";
import { useTaskDependencies } from "../project-details/hooks/useTaskDependencies";
import { useTaskStatusManager } from "./status/TaskStatusManager";

interface TaskListItemProps {
  task: Task;
  onStatusChange: (taskId: string, status: string) => void;
  onDelete?: (taskId: string) => void;
  onTaskUpdated?: () => void;
}

export const TaskListItem = ({ task, onStatusChange, onDelete, onTaskUpdated }: TaskListItemProps) => {
  // Dialog states
  const [showDiscussion, setShowDiscussion] = useState(false);
  const [isAttachmentDialogOpen, setIsAttachmentDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isTemplatesDialogOpen, setIsTemplatesDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [showDependencies, setShowDependencies] = useState(false);
  
  // Current task status
  const currentStatus = task.status || "pending";
  
  // Task dependencies hook
  const { dependencies, dependentTasks } = useTaskDependencies(task.id);
  
  // Dependency UI properties
  const hasDependencies = dependencies.length > 0;
  const hasDependents = dependentTasks.length > 0;
  const dependencyIconColor = hasDependencies && dependencies.some(d => d.status !== 'completed') 
    ? 'text-amber-500' 
    : hasDependencies || hasDependents 
      ? 'text-blue-500' 
      : 'text-gray-500';
  
  // Task status management
  const { isUpdating, handleStatusChange } = useTaskStatusManager({
    taskId: task.id,
    taskTitle: task.title,
    isSubtask: !!task.is_subtask,
    currentStatus,
    dueDate: task.due_date,
    projectId: task.project_id,
    projectName: task.project_name,
    assignedTo: task.assigned_to,
    onStatusChange
  });

  // Handlers
  const handleEditTask = () => {
    setIsEditDialogOpen(true);
  };

  return (
    <div className="bg-card hover:bg-accent/5 border rounded-lg p-4 transition-colors">
      <TaskHeader 
        task={task} 
        status={currentStatus} 
        onDependenciesClick={() => setShowDependencies(true)}
        hasDependencies={hasDependencies}
        hasDependents={hasDependents}
        dependencyIconColor={dependencyIconColor}
      />
      
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
        onDelete={onDelete}
        onEdit={handleEditTask}
        taskId={task.id}
        isGeneral={task.is_general}
      />
      
      <TaskDialogs
        task={task}
        showDiscussion={showDiscussion}
        setShowDiscussion={setShowDiscussion}
        isAttachmentDialogOpen={isAttachmentDialogOpen}
        setIsAttachmentDialogOpen={setIsAttachmentDialogOpen}
        isUploadDialogOpen={isUploadDialogOpen}
        setIsUploadDialogOpen={setIsUploadDialogOpen}
        isTemplatesDialogOpen={isTemplatesDialogOpen}
        setIsTemplatesDialogOpen={setIsTemplatesDialogOpen}
        isEditDialogOpen={isEditDialogOpen}
        setIsEditDialogOpen={setIsEditDialogOpen}
        showDependencies={showDependencies}
        setShowDependencies={setShowDependencies}
        onStatusChange={onStatusChange}
        onTaskUpdated={onTaskUpdated}
      />
    </div>
  );
};
