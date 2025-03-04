
import { useState, useEffect } from "react";
import { TaskTitleField } from "./components/TaskTitleField";
import { TaskDescriptionField } from "./components/TaskDescriptionField";
import { TaskDateField } from "./components/TaskDateField";
import { TaskPriorityField } from "./components/TaskPriorityField";
import { TaskStageField } from "./components/TaskStageField";
import { TaskAssigneeField } from "./components/TaskAssigneeField";
import { TaskFormActions } from "./components/TaskFormActions";
import { useProjectMembers } from "./hooks/useProjectMembers";
import { TaskAttachmentField } from "./components/TaskAttachmentField";

export interface TaskFormProps {
  onSubmit: (formData: {
    title: string;
    description: string;
    dueDate: string;
    priority: string;
    stageId: string;
    assignedTo: string | null;
    attachment?: File[] | null;
  }) => Promise<void>;
  isSubmitting: boolean;
  projectStages: { id: string; name: string }[];
  projectId: string | undefined;
  attachment?: File[] | null;
  setAttachment?: (file: File[] | null) => void;
}

export const TaskForm = ({ 
  onSubmit, 
  isSubmitting, 
  projectStages,
  projectId,
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
  
  const { projectMembers } = useProjectMembers(projectId);
  
  // استخدم ملف المرفق من الخارج إذا تم توفيره
  const fileAttachment = attachment !== undefined ? attachment : localAttachment;
  const setFileAttachment = setAttachment || setLocalAttachment;
  
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
      assignedTo,
      attachment: fileAttachment
    });
  };

  const handleCancel = () => {
    // Reset form or handle cancel
    console.log("Form cancelled");
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
      
      <TaskFormActions isSubmitting={isSubmitting} onCancel={handleCancel} />
    </form>
  );
};
