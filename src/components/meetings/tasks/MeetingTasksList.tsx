
import React, { useState } from "react";
import { TasksList as BaseTasksList } from "@/components/tasks/TasksList";
import { Task } from "@/components/tasks/types/task";
import { TaskDialogsProvider } from "@/components/tasks/components/dialogs/TaskDialogsProvider";
import { MeetingTask } from "@/types/meeting";
import { Button } from "@/components/ui/button";
import { MessageCircle, Pencil, XCircle } from "lucide-react";
import { EditTaskDialog } from "./EditTaskDialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
  const [taskToEdit, setTaskToEdit] = useState<MeetingTask | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenDiscussion = (task: Task) => {
    setSelectedTask(task);
  };

  const handleEditTask = (task: Task) => {
    // Convert Task to MeetingTask
    const meetingTask: MeetingTask = {
      id: task.id,
      meeting_id: meetingId,
      title: task.title,
      description: task.description || "",
      status: task.status as any,
      priority: task.priority as any,
      due_date: task.due_date || "",
      assigned_to: task.assigned_to || "",
      created_at: task.created_at,
      task_type: "execution", // Default value
      requires_deliverable: task.requires_deliverable || false
    };
    
    setTaskToEdit(meetingTask);
    setIsEditDialogOpen(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (isDeleting) return;
    
    if (confirm("هل أنت متأكد من حذف هذه المهمة؟")) {
      setIsDeleting(true);
      
      try {
        const { error } = await supabase
          .from('meeting_tasks')
          .delete()
          .eq('id', taskId);
          
        if (error) throw error;
        
        toast.success("تم حذف المهمة بنجاح");
        onTasksChange();
      } catch (error) {
        console.error('Error deleting task:', error);
        toast.error("حدث خطأ أثناء حذف المهمة");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const renderTaskActions = (task: Task) => {
    return (
      <div className="flex space-x-2 mt-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground"
          onClick={() => handleOpenDiscussion(task)}
        >
          <MessageCircle className="h-3.5 w-3.5" />
          مناقشة
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground"
          onClick={() => handleEditTask(task)}
        >
          <Pencil className="h-3.5 w-3.5" />
          تعديل
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs flex items-center gap-1 text-red-500 hover:text-red-600"
          onClick={() => handleDeleteTask(task.id)}
          disabled={isDeleting}
        >
          <XCircle className="h-3.5 w-3.5" />
          حذف
        </Button>
      </div>
    );
  };

  return (
    <>
      <BaseTasksList 
        tasks={tasks} 
        isLoading={isLoading} 
        error={error} 
        onTasksChange={onTasksChange}
        meetingId={meetingId}
        onStatusChange={onStatusChange}
        renderTaskActions={renderTaskActions}
      />
      
      {selectedTask && (
        <TaskDialogsProvider 
          task={selectedTask}
          onStatusChange={onStatusChange}
          onTaskUpdated={onTasksChange}
          initialDialog="discussion"
        />
      )}
      
      {taskToEdit && (
        <EditTaskDialog
          meetingId={meetingId}
          task={taskToEdit}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSuccess={onTasksChange}
        />
      )}
    </>
  );
};
