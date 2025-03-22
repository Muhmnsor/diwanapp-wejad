
import { useState } from "react";
import { TaskForm } from "@/components/tasks/project-details/TaskForm";
import { useCreateMeetingTask } from "@/hooks/meetings/useCreateMeetingTask";
import { TaskType } from "@/types/meeting";
import { toast } from "sonner";

interface MeetingTaskFormProps {
  meetingId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export const MeetingTaskForm = ({ 
  meetingId, 
  onSuccess,
  onCancel,
  isSubmitting: externalIsSubmitting 
}: MeetingTaskFormProps) => {
  const [taskType, setTaskType] = useState<TaskType>("action_item");
  const [addToGeneralTasks, setAddToGeneralTasks] = useState(true);
  
  const { mutate: createTask, isPending } = useCreateMeetingTask();
  
  // For the ProjectMember type compatibility
  const dummyMembers = [
    { user_id: "", user_name: "يرجى تحديد المسؤول" }
  ];
  
  // For stages compatibility
  const meetingTaskStages = [
    { id: "pending", name: "قيد الانتظار" },
    { id: "in_progress", name: "قيد التنفيذ" },
    { id: "completed", name: "مكتملة" }
  ];
  
  const handleSubmit = async (formData: {
    title: string;
    description: string;
    dueDate: string;
    priority: string;
    stageId: string;
    assignedTo: string | null;
    templates?: File[] | null;
    category?: string;
    requiresDeliverable?: boolean;
  }) => {
    if (!meetingId) {
      toast.error("خطأ: معرّف الاجتماع مفقود");
      return;
    }
    
    if (!formData.title.trim()) {
      toast.error("يرجى إدخال عنوان المهمة");
      return;
    }
    
    console.log("Submitting meeting task with data:", {
      meeting_id: meetingId,
      title: formData.title,
      description: formData.description,
      due_date: formData.dueDate,
      assigned_to: formData.assignedTo,
      task_type: taskType,
      add_to_general_tasks: addToGeneralTasks,
      requires_deliverable: formData.requiresDeliverable
    });
    
    createTask({
      meeting_id: meetingId,
      title: formData.title,
      description: formData.description || undefined,
      due_date: formData.dueDate || undefined,
      assigned_to: formData.assignedTo || undefined,
      task_type: taskType,
      status: "pending",
      add_to_general_tasks: addToGeneralTasks
    }, {
      onSuccess: () => {
        console.log("Meeting task created successfully");
        toast.success("تمت إضافة المهمة بنجاح");
        if (onSuccess) onSuccess();
      },
      onError: (error) => {
        console.error("Error creating meeting task:", error);
        toast.error("حدث خطأ أثناء إضافة المهمة");
      }
    });
  };

  return (
    <div className="meeting-task-form">
      <TaskForm
        onSubmit={handleSubmit}
        isSubmitting={externalIsSubmitting || isPending}
        projectStages={meetingTaskStages}
        projectMembers={dummyMembers}
        isGeneral={true}
      />
    </div>
  );
};
