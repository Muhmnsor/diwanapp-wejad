import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KeyboardEvent, useState } from "react";
import { TaskDateField } from "../../components/TaskDateField";
import { TaskAssigneeField } from "../../components/TaskAssigneeField";
import { TaskPriorityField } from "../../components/TaskPriorityField";
import { useProjectMembers } from "../../hooks/useProjectMembers";

interface AddSubtaskFormProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (dueDate: string, assignedTo: string) => void;
  onCancel: () => void;
  projectId: string;
}

export const AddSubtaskForm = ({ 
  value, 
  onChange, 
  onSubmit, 
  onCancel,
  projectId 
}: AddSubtaskFormProps) => {
  const [dueDate, setDueDate] = useState<string>("");
  const [assignedTo, setAssignedTo] = useState<string>("");
  const [priority, setPriority] = useState<string>("medium");
  const { projectMembers } = useProjectMembers(projectId);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  const handleSubmit = () => {
    if (value.trim()) {
      console.log("Submitting subtask:", { value, dueDate, assignedTo, priority });
      onSubmit(dueDate, assignedTo);
    }
  };

  return (
    <div className="space-y-3 border p-3 rounded-md bg-card">
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="عنوان المهمة الفرعية"
        className="text-sm"
        autoFocus
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <TaskDateField dueDate={dueDate} setDueDate={setDueDate} />
        <TaskAssigneeField 
          assignedTo={assignedTo} 
          setAssignedTo={setAssignedTo} 
          projectMembers={projectMembers || []} 
        />
        <TaskPriorityField priority={priority} setPriority={setPriority} />
      </div>
      
      <div className="flex gap-1 justify-end">
        <Button 
          type="button" 
          size="sm" 
          className="h-9"
          onClick={handleSubmit}
          disabled={!value.trim()}
        >
          إضافة
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          className="h-9"
          onClick={onCancel}
        >
          إلغاء
        </Button>
      </div>
    </div>
  );
};
