import { Button } from "@/components/ui/button";
import { TaskFormFields } from "./TaskFormFields";
import { useState } from "react";

interface TaskFormProps {
  onSubmit: (formData: {
    title: string;
    description: string;
    dueDate: string;
    priority: string;
    assignedTo: string;
  }) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
  workspaceId: string;
}

export const TaskForm = ({ onSubmit, isSubmitting, onCancel, workspaceId }: TaskFormProps) => {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("medium");
  const [assignedTo, setAssignedTo] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ 
      title, 
      description: "", // Send empty string since we removed description field
      dueDate, 
      priority, 
      assignedTo 
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TaskFormFields
        title={title}
        setTitle={setTitle}
        dueDate={dueDate}
        setDueDate={setDueDate}
        priority={priority}
        setPriority={setPriority}
        assignedTo={assignedTo}
        setAssignedTo={setAssignedTo}
        workspaceId={workspaceId}
      />

      <div className="flex justify-start gap-2 mt-6">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "جاري الإضافة..." : "إضافة المهمة"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          إلغاء
        </Button>
      </div>
    </form>
  );
};