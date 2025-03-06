
import React from "react";
import { SubtaskItem } from "./SubtaskItem";
import { Subtask } from "../../types/subtask";

interface SubtasksListItemsProps {
  subtasks: Subtask[];
  onUpdateStatus: (subtaskId: string, newStatus: string) => Promise<void>;
  onDelete: (subtaskId: string) => Promise<void>;
  onEdit: (subtask: Subtask) => void;
}

export const SubtasksListItems: React.FC<SubtasksListItemsProps> = ({ 
  subtasks, 
  onUpdateStatus, 
  onDelete,
  onEdit
}) => {
  if (subtasks.length === 0) return null;

  return (
    <div className="border rounded-md bg-white">
      {subtasks.map(subtask => (
        <SubtaskItem
          key={subtask.id}
          subtask={subtask}
          onUpdateStatus={onUpdateStatus}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
};
