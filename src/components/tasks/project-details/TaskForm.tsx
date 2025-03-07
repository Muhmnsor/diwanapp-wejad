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
import { TaskDependenciesField, TaskDependency } from "./components/TaskDependenciesField";
import { ProjectMember } from "./hooks/useProjectMembers";
import { DependencyType } from "./hooks/useTaskDependencies";

export interface TaskFormProps {
  onSubmit: (formData: any) => void;
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
    dependencies?: {
      id?: string;
      taskId: string;
      dependencyType: DependencyType;
    }[];
  };
  isEditMode?: boolean;
  projectId?: string;
}

export const TaskForm = ({
  onSubmit,
  isSubmitting,
  projectStages,
  projectMembers,
  isGeneral,
  initialValues,
  isEditMode = false,
  projectId
}: TaskFormProps) => {
  const [title, setTitle] = useState(initialValues?.title || "");
  const [description, setDescription] = useState(initialValues?.description || "");
  const [dueDate, setDueDate] = useState(initialValues?.dueDate || "");
  const [priority, setPriority] = useState(initialValues?.priority || "medium");
  const [stageId, setStageId] = useState(initialValues?.stageId || "");
  const [assignedTo, setAssignedTo] = useState<string | null>(initialValues?.assignedTo || null);
  const [templates, setTemplates] = useState<File[] | null>(null);
  const [category, setCategory] = useState<string>(initialValues?.category || "");
  const [selectedDependencies, setSelectedDependencies] = useState<TaskDependency[]>(
    initialValues?.dependencies || []
  );
  
  useEffect(() => {
    if (projectStages.length > 0 && !stageId) {
      setStageId(projectStages[0].id);
    }
    
    if (projectMembers.length > 0 && assignedTo === null) {
      setAssignedTo(projectMembers[0].user_id);
    }
  }, [projectStages, stageId, projectMembers, assignedTo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = {
      title,
      description,
      dueDate,
      priority,
      stageId,
      assignedTo,
      templates,
      category: isGeneral ? category : undefined,
      dependencies: selectedDependencies
    };
    
    onSubmit(formData);
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
          <TaskCategoryField category={category} setCategory={setCategory} />
        ) : (
          <TaskStageField stageId={stageId} setStageId={setStageId} projectStages={projectStages} />
        )}
        <TaskAssigneeField 
          assignedTo={assignedTo} 
          setAssignedTo={setAssignedTo} 
          projectMembers={projectMembers} 
        />
      </div>
      
      {!isGeneral && projectId && (
        <TaskDependenciesField 
          projectId={projectId}
          selectedDependencies={selectedDependencies}
          setSelectedDependencies={setSelectedDependencies}
          currentTaskId={initialValues?.stageId}
        />
      )}
      
      <TaskAttachmentField
        attachment={templates}
        setAttachment={setTemplates}
        category="template"
      />
      
      <TaskFormActions 
        isSubmitting={isSubmitting} 
        onCancel={() => console.log("Form cancelled")} 
        submitLabel={isEditMode ? "تحديث المهمة" : "إضافة المهمة"}
      />
    </form>
  );
};
