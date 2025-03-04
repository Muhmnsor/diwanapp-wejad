
import { useState } from "react";
import { toast } from "sonner";
import { createTask, updateProjectStatusIfCompleted } from "../services/taskService";
import { TaskFormData } from "../types/addTask";

export const useAddTask = (
  projectId: string | undefined,
  projectStages: { id: string; name: string }[],
  onSuccess: () => void,
  onClose: () => void
) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("low");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [stageId, setStageId] = useState(projectStages[0]?.id || "");
  const [assignedTo, setAssignedTo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: TaskFormData) => {
    if (!projectId) {
      toast.error("معرف المشروع غير موجود");
      return;
    }

    try {
      setIsSubmitting(true);

      await createTask(projectId, formData);
      await updateProjectStatusIfCompleted(projectId);

      toast.success("تم إنشاء المهمة بنجاح");
      
      // Reset the form and close the dialog
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast.error("حدث خطأ أثناء إنشاء المهمة");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formState: {
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
    },
    isSubmitting,
    handleSubmit,
  };
};
