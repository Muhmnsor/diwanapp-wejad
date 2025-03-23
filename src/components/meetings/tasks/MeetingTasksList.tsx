
import React, { useState } from "react";
import { TasksList } from "@/components/tasks/TasksList";
import { Task } from "@/components/tasks/types/task";
import { TaskDialogsProvider } from "@/components/tasks/components/dialogs/TaskDialogsProvider";
import { MeetingTask } from "@/types/meeting";
import { EditTaskDialog } from "./EditTaskDialog";
import { Button } from "@/components/ui/button";
import { PencilIcon, Trash2Icon } from "lucide-react";
import { useDeleteMeetingTask } from "@/hooks/meetings/useDeleteMeetingTask";
import { toast } from "sonner";

interface MeetingTasksListProps {
  tasks: Task[];
  isLoading: boolean;
  error: any;
  onTasksChange: () => void;
  meetingId: string;
  onStatusChange: (taskId: string, status: string) => void;
}

export const MeetingTasksList: React.FC<MeetingTasksListProps> = ({
  tasks,
  isLoading,
  error,
  onTasksChange,
  meetingId,
  onStatusChange
}) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { mutate: deleteTask } = useDeleteMeetingTask();

  // Find the corresponding meeting task for the Task object
  const findMeetingTask = (taskId: string): MeetingTask | undefined => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return undefined;
    
    // Convert Task to MeetingTask
    return {
      id: task.id,
      meeting_id: meetingId,
      title: task.title,
      description: task.description || undefined,
      status: task.status as any,
      priority: task.priority as any,
      due_date: task.due_date || undefined,
      assigned_to: task.assigned_to || undefined,
      created_at: task.created_at,
      created_by: undefined,
      task_type: "action_item", // Default
      requires_deliverable: task.requires_deliverable || false,
      general_task_id: undefined
    };
  };

  const handleEditTask = (taskId: string) => {
    const task = findMeetingTask(taskId);
    if (task) {
      setSelectedTask(task as any);
      setIsEditDialogOpen(true);
    } else {
      toast.error("لم يتم العثور على بيانات المهمة");
    }
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm("هل أنت متأكد من رغبتك في حذف هذه المهمة؟")) {
      deleteTask({ 
        id: taskId, 
        meeting_id: meetingId 
      }, {
        onSuccess: () => {
          onTasksChange();
        }
      });
    }
  };

  // Create custom action buttons for meeting tasks
  const renderTaskActions = (taskId: string) => (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleEditTask(taskId)}
        className="h-8 px-2"
      >
        <PencilIcon className="h-4 w-4" />
        <span className="sr-only">تعديل</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleDeleteTask(taskId)}
        className="h-8 px-2 text-red-500 hover:text-red-600 hover:bg-red-50"
      >
        <Trash2Icon className="h-4 w-4" />
        <span className="sr-only">حذف</span>
      </Button>
    </div>
  );

  return (
    <>
      <TasksList 
        projectId={undefined}
        isWorkspace={false}
      />
      
      {selectedTask && (
        <EditTaskDialog
          meetingId={meetingId}
          task={selectedTask as MeetingTask}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSuccess={onTasksChange}
        />
      )}
    </>
  );
};
