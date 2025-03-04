
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TaskStageField } from "./TaskStageField";
import { TaskPriorityField } from "./TaskPriorityField";
import { TaskDueDateField } from "./TaskDueDateField";
import { TaskAssigneeField } from "./TaskAssigneeField";
import { TaskFormData } from "../types/addTask";

interface TaskFormProps {
  title: string;
  setTitle: (title: string) => void;
  description: string;
  setDescription: (description: string) => void;
  priority: string;
  setPriority: (priority: string) => void;
  dueDate: Date | null;
  setDueDate: (dueDate: Date | null) => void;
  stageId: string;
  setStageId: (stageId: string) => void;
  assignedTo: string;
  setAssignedTo: (assignedTo: string) => void;
  projectStages: { id: string; name: string }[];
}

export const TaskForm = ({
  title,
  setTitle,
  description,
  setDescription,
  priority,
  setPriority,
  dueDate,
  setDueDate,
  stageId,
  setStageId,
  assignedTo,
  setAssignedTo,
  projectStages,
}: TaskFormProps) => {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="name">عنوان المهمة</Label>
        <Input 
          type="text" 
          id="name" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="description">وصف المهمة</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      
      <TaskStageField 
        stageId={stageId} 
        onStageIdChange={setStageId} 
        projectStages={projectStages} 
      />
      
      <TaskPriorityField 
        priority={priority} 
        onPriorityChange={setPriority} 
      />
      
      <TaskDueDateField 
        dueDate={dueDate} 
        onDueDateChange={setDueDate} 
      />

      <TaskAssigneeField 
        assignedTo={assignedTo} 
        onAssignedToChange={setAssignedTo} 
      />
    </div>
  );
};
