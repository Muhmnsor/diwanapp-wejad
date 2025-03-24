
import { useState, useEffect } from "react";
import { TaskTitleField } from "./components/TaskTitleField";
import { TaskDescriptionField } from "./components/TaskDescriptionField";
import { TaskDateField } from "./components/TaskDateField";
import { TaskPriorityField } from "./components/TaskPriorityField";
import { TaskStageField } from "./components/TaskStageField";
import { TaskAssigneeField } from "./components/TaskAssigneeField";
import { TaskFormActions } from "./components/TaskFormActions";
import { TaskAttachmentField } from "./components/TaskAttachmentField";
import { TaskCategoryField } from "./components/TaskCategoryField";
import { ProjectMember } from "./types/projectMember";
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
    templates?: File[] | null;
    category?: string;
    requiresDeliverable?: boolean;
  }) => Promise<void>;
  isSubmitting: boolean;
  projectStages: { id: string; name: string }[];
  projectMembers: ProjectMember[];
  isGeneral?: boolean;
  initialValues?: {
    title: string;
    description: string;
    dueDate: string;
    priority: string;
    stageId: string;
    assignedTo: string | null;
    category?: string;
    requiresDeliverable?: boolean;
  };
  isEditMode?: boolean;
  meetingId?: string;
}

export const TaskForm = ({ 
  onSubmit, 
  isSubmitting, 
  projectStages,
  projectMembers,
  isGeneral,
  initialValues,
  isEditMode = false,
  meetingId
}: TaskFormProps) => {
  const [title, setTitle] = useState(initialValues?.title || "");
  const [description, setDescription] = useState(initialValues?.description || "");
  const [dueDate, setDueDate] = useState(initialValues?.dueDate || "");
  const [priority, setPriority] = useState(initialValues?.priority || "medium");
  const [stageId, setStageId] = useState(initialValues?.stageId || "");
  const [assignedTo, setAssignedTo] = useState<string | null>(initialValues?.assignedTo || null);
  const [templates, setTemplates] = useState<File[] | null>(null);
  const [category, setCategory] = useState<string>(initialValues?.category || (meetingId ? "تحضيرية" : "إدارية"));
  const [requiresDeliverable, setRequiresDeliverable] = useState<boolean>(initialValues?.requiresDeliverable || false);
  
  // Check if this is a meeting task
  const isMeetingTask = !!meetingId;
  
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
    
    console.log("Submitting form with data:", { 
      title, 
      description, 
      dueDate, 
      priority, 
      stageId,
      assignedTo,
      templates,
      category: isGeneral ? category : undefined,
      requiresDeliverable
    });
    
    await onSubmit({ 
      title, 
      description, 
      dueDate, 
      priority, 
      stageId,
      assignedTo,
      templates,
      category: isGeneral ? category : undefined,
      requiresDeliverable
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
        {isGeneral ? (
          <TaskCategoryField 
            category={category} 
            setCategory={setCategory} 
            isMeetingTask={isMeetingTask} 
          />
        ) : (
          <TaskStageField stageId={stageId} setStageId={setStageId} projectStages={projectStages} />
        )}
        <TaskAssigneeField 
          assignedTo={assignedTo} 
          setAssignedTo={setAssignedTo} 
          projectMembers={projectMembers} 
        />
      </div>
      
      {/* حقل النماذج فقط */}
      <TaskAttachmentField
        attachment={templates}
        setAttachment={setTemplates}
        category="template"
      />
      
      {/* إضافة الخيار الجديد لجعل المستلمات إلزامية */}
      <div className="flex items-center space-x-2 space-x-reverse">
        <Checkbox 
          id="requiresDeliverable"
          checked={requiresDeliverable}
          onCheckedChange={(checked) => setRequiresDeliverable(checked as boolean)}
        />
        <Label 
          htmlFor="requiresDeliverable" 
          className="text-sm cursor-pointer hover:text-primary transition-colors"
        >
          مستلمات المهمة إلزامية للإكمال
        </Label>
      </div>
      
      <TaskFormActions 
        isSubmitting={isSubmitting} 
        onCancel={() => console.log("Form cancelled")} 
        submitLabel={isEditMode ? "تحديث المهمة" : "إضافة المهمة"}
      />
    </form>
  );
};
