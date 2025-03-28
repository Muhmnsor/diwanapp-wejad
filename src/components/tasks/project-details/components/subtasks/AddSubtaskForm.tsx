
import { useState } from "react";
import { ProjectMember } from "../../types/projectMember";
import { SubtaskTitleField } from "./fields/SubtaskTitleField";
import { SubtaskDueDateField } from "./fields/SubtaskDueDateField";
import { SubtaskAssigneeField } from "./fields/SubtaskAssigneeField";
import { SubtaskFormActions } from "./fields/SubtaskFormActions";

interface AddSubtaskFormProps {
  onSubmit: (title: string, dueDate?: string, assignedTo?: string) => Promise<void>;
  onCancel: () => void;
  projectMembers: ProjectMember[];
  isLoading?: boolean;
}

export const AddSubtaskForm = ({ onSubmit, onCancel, projectMembers, isLoading = false }: AddSubtaskFormProps) => {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    // If assignedTo is empty, set it to "none" to avoid issues
    const finalAssignedTo = assignedTo || "none";
    
    console.log(`Submitting subtask: Title=${title}, DueDate=${dueDate || 'none'}, AssignedTo=${finalAssignedTo}`);
    await onSubmit(title, dueDate || undefined, finalAssignedTo);
    setTitle("");
    setDueDate("");
    setAssignedTo("");
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-3 border rounded-md bg-gray-50">
      <SubtaskTitleField 
        title={title}
        setTitle={setTitle}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <SubtaskDueDateField 
          dueDate={dueDate}
          setDueDate={setDueDate}
        />
        
        <SubtaskAssigneeField 
          assignedTo={assignedTo}
          setAssignedTo={setAssignedTo}
          projectMembers={projectMembers}
        />
      </div>
      
      <SubtaskFormActions 
        onCancel={onCancel}
        isLoading={isLoading}
        isValid={title.trim().length > 0}
      />
    </form>
  );
};
