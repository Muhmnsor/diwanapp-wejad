
import { useState, useEffect } from "react";
import { TaskTitleField } from "./components/TaskTitleField";
import { TaskDescriptionField } from "./components/TaskDescriptionField";
import { TaskDateField } from "./components/TaskDateField";
import { TaskPriorityField } from "./components/TaskPriorityField";
import { TaskStageField } from "./components/TaskStageField";
import { TaskAssigneeField } from "./components/TaskAssigneeField";
import { TaskFormActions } from "./components/TaskFormActions";
import { useProjectMembers } from "./hooks/useProjectMembers";

interface TaskFormProps {
  onSubmit: (formData: {
    title: string;
    description: string;
    dueDate: string;
    priority: string;
    stageId: string;
    assignedTo: string | null;
  }) => Promise<void>;
  isSubmitting: boolean;
  projectStages: { id: string; name: string }[];
  projectId: string | undefined;
}

export const TaskForm = ({ 
  onSubmit, 
  isSubmitting, 
  projectStages,
  projectId
}: TaskFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("medium");
  const [stageId, setStageId] = useState("");
  const [assignedTo, setAssignedTo] = useState<string | null>(null);
  
  const { members } = useProjectMembers(projectId);
  
  useEffect(() => {
    if (projectStages.length > 0 && !stageId) {
      setStageId(projectStages[0].id);
    }
  }, [projectStages, stageId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ 
      title, 
      description, 
      dueDate, 
      priority, 
      stageId,
      assignedTo 
    });
  };

  const handleCancel = () => {
    onSubmit({ 
      title: "", 
      description: "", 
      dueDate: "", 
      priority: "medium", 
      stageId: "", 
      assignedTo: null 
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TaskTitleField title={title} setTitle={setTitle} />
      <TaskDescriptionField description={description} setDescription={setDescription} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TaskDateField dueDate={dueDate} setDueDate={setDueDate} />
        <TaskPriorityField priority={priority} setPriority={setPriority} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TaskStageField stageId={stageId} setStageId={setStageId} projectStages={projectStages} />
        <TaskAssigneeField 
          assignedTo={assignedTo} 
          setAssignedTo={setAssignedTo} 
          projectMembers={members} 
        />
      </div>
      
      <TaskFormActions isSubmitting={isSubmitting} onCancel={handleCancel} />
    </form>
  );
};
