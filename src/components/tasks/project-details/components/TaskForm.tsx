import { useState, useEffect } from "react";
import { TaskTitleField } from "./TaskTitleField";
import { TaskDescriptionField } from "./TaskDescriptionField";
import { TaskDateField } from "./TaskDateField";
import { TaskPriorityField } from "./TaskPriorityField";
import { TaskStageField } from "./TaskStageField";
import { TaskAssigneeField } from "./TaskAssigneeField";
import { TaskFormActions } from "./TaskFormActions";
import { TaskAttachmentField } from "./TaskAttachmentField";
import { TaskCategoryField } from "./TaskCategoryField";
import { ProjectMember } from "../types/projectMember";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export interface TaskFormProps {
  onSubmit: (formData: {
    title: string;
    description: string;
    dueDate: string;
    priority: string;
    stageId: string;
    assignedTo: string | null;
    attachment?: File[] | null;
    category: string;
  }) => Promise<void>;
  isSubmitting: boolean;
  projectStages: { id: string; name: string }[];
  projectMembers: ProjectMember[];
  attachment?: File[] | null;
  setAttachment?: (files: File[] | null) => void;
}

export const TaskForm = ({ 
  onSubmit, 
  isSubmitting, 
  projectStages,
  projectMembers,
  attachment,
  setAttachment
}: TaskFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("medium");
  const [stageId, setStageId] = useState("");
  const [assignedTo, setAssignedTo] = useState<string | null>(null);
  const [localAttachment, setLocalAttachment] = useState<File[] | null>(null);
  const [category, setCategory] = useState("");

  const fileAttachment = attachment !== undefined ? attachment : localAttachment;
  const setFileAttachment = setAttachment || setLocalAttachment;

  useEffect(() => {
    if (projectStages.length > 0 && !stageId) {
      setStageId(projectStages[0].id);
    }
    
    if (projectMembers.length > 0 && assignedTo === null) {
      setAssignedTo(projectMembers[0].user_id);
    }
  }, [projectStages, stageId, projectMembers, assignedTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ 
      title, 
      description, 
      dueDate, 
      priority, 
      stageId,
      assignedTo,
      attachment: fileAttachment,
      category
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto p-1 rtl">
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
          projectMembers={projectMembers} 
        />
      </div>
      
      <TaskAttachmentField
        attachment={fileAttachment}
        setAttachment={setFileAttachment}
      />
      
      <TaskCategoryField category={category} setCategory={setCategory} />
      
      <TaskFormActions isSubmitting={isSubmitting} onCancel={() => console.log("Form cancelled")} />
    </form>
  );
};
