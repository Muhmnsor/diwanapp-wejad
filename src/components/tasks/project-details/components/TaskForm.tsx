
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TaskPriorityField } from "./TaskPriorityField";
import { TaskStageField } from "./TaskStageField";
import { TaskAssigneeField } from "./TaskAssigneeField";
import { TaskDueDateField } from "./TaskDueDateField";
import { TaskFormProps } from "../types/taskForm";

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
  projectMembers
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
        setStageId={setStageId} 
        projectStages={projectStages} 
      />
      
      <TaskPriorityField 
        priority={priority} 
        setPriority={setPriority} 
      />
      
      <TaskDueDateField 
        dueDate={dueDate}
        setDueDate={setDueDate}
      />

      <TaskAssigneeField 
        assignedTo={assignedTo} 
        setAssignedTo={setAssignedTo} 
        projectMembers={projectMembers} 
      />
    </div>
  );
};
