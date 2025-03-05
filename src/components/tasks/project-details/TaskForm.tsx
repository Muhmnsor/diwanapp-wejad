
import { useState, useEffect } from "react";
import { TaskTitleField } from "./components/TaskTitleField";
import { TaskDescriptionField } from "./components/TaskDescriptionField";
import { TaskDateField } from "./components/TaskDateField";
import { TaskPriorityField } from "./components/TaskPriorityField";
import { TaskStageField } from "./components/TaskStageField";
import { TaskAssigneeField } from "./components/TaskAssigneeField";
import { TaskFormActions } from "./components/TaskFormActions";
import { TaskAttachmentField } from "./components/TaskAttachmentField";
import { ProjectMember } from "./hooks/useProjectMembers";

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
  const [templates, setTemplates] = useState<File[] | null>(null);
  
  // استخدم ملف المرفق من الخارج إذا تم توفيره
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
    
    // جمع جميع الملفات - المرفقات والنماذج
    const allFiles = [];
    
    if (fileAttachment) {
      allFiles.push(...fileAttachment);
    }
    
    if (templates) {
      // إضافة علامة للنماذج
      const templatesWithCategory = templates.map(file => 
        Object.assign(file, { category: 'template' })
      );
      allFiles.push(...templatesWithCategory);
    }
    
    console.log("Submitting form with data:", { 
      title, 
      description, 
      dueDate, 
      priority, 
      stageId,
      assignedTo,
      attachment: allFiles.length > 0 ? allFiles : null
    });
    
    await onSubmit({ 
      title, 
      description, 
      dueDate, 
      priority, 
      stageId,
      assignedTo,
      attachment: allFiles.length > 0 ? allFiles : null
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
      
      {/* حقل المرفقات */}
      <TaskAttachmentField
        attachment={fileAttachment}
        setAttachment={setFileAttachment}
        category="creator"
      />
      
      {/* حقل النماذج */}
      <TaskAttachmentField
        attachment={templates}
        setAttachment={setTemplates}
        category="template"
      />
      
      <TaskFormActions isSubmitting={isSubmitting} onCancel={() => console.log("Form cancelled")} />
    </form>
  );
};
