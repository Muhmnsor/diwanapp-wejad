import { Button } from "@/components/ui/button";
import { TaskFormFields } from "./TaskFormFields";
import { useState } from "react";

interface TaskFormProps {
  onSubmit: (formData: {
    title: string;
    description: string;
    dueDate: string;
    priority: string;
  }) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
}

export const TaskForm = ({ onSubmit, isSubmitting, onCancel }: TaskFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("medium");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ title, description, dueDate, priority });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TaskFormFields
        title={title}
        setTitle={setTitle}
        description={description}
        setDescription={setDescription}
        dueDate={dueDate}
        setDueDate={setDueDate}
        priority={priority}
        setPriority={setPriority}
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