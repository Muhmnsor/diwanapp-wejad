
import React from "react";
import { AddSubtaskForm } from "./AddSubtaskForm";
import { SubtasksHeader } from "./SubtasksHeader";
import { SubtasksErrorState } from "./SubtasksErrorState";
import { SubtasksEmptyState } from "./SubtasksEmptyState";
import { SubtasksListItems } from "./SubtasksListItems";
import { Subtask } from "../../types/subtask";
import { useProjectMembers } from "../../hooks/useProjectMembers";
import { useSubtasksList } from "../../hooks/useSubtasksList";

interface SubtasksListProps {
  taskId: string;
  projectId: string;
  subtasks?: Subtask[];
  onAddSubtask?: (taskId: string, title: string, dueDate?: string, assignedTo?: string) => Promise<void>;
  onUpdateSubtaskStatus?: (subtaskId: string, newStatus: string) => Promise<void>;
  onDeleteSubtask?: (subtaskId: string) => Promise<void>;
}

export const SubtasksList: React.FC<SubtasksListProps> = ({ 
  taskId, 
  projectId,
  subtasks: externalSubtasks,
  onAddSubtask: externalAddSubtask,
  onUpdateSubtaskStatus: externalUpdateStatus,
  onDeleteSubtask: externalDeleteSubtask
}) => {
  const { projectMembers } = useProjectMembers(projectId);
  const { 
    subtasks,
    isLoading,
    error,
    isAddingSubtask,
    setIsAddingSubtask,
    handleAddSubtask,
    handleUpdateStatus,
    handleDeleteSubtask
  } = useSubtasksList(
    taskId, 
    externalSubtasks, 
    externalAddSubtask, 
    externalUpdateStatus, 
    externalDeleteSubtask
  );
  
  // If there was an error, show the error state
  if (error) {
    return <SubtasksErrorState error={error} />;
  }
  
  return (
    <div className="mt-3 space-y-2">
      <SubtasksHeader 
        onAddClick={() => setIsAddingSubtask(true)}
        isAddingSubtask={isAddingSubtask}
      />
      
      {isAddingSubtask && (
        <AddSubtaskForm 
          onSubmit={handleAddSubtask}
          onCancel={() => setIsAddingSubtask(false)}
          projectMembers={projectMembers}
          isLoading={isLoading}
        />
      )}
      
      {subtasks.length > 0 ? (
        <SubtasksListItems
          subtasks={subtasks}
          onUpdateStatus={handleUpdateStatus}
          onDelete={handleDeleteSubtask}
        />
      ) : (
        !isAddingSubtask && <SubtasksEmptyState />
      )}
    </div>
  );
};
