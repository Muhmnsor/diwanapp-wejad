
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useMeetingTasks } from "@/hooks/meetings/useMeetingTasks";
import { useState } from "react";
import { CustomEnhancedTaskDialog } from "./CustomEnhancedTaskDialog";
import { Task } from "@/components/tasks/types/task";
import { MeetingTask } from "@/types/meeting";
import { TasksList } from "@/components/tasks/project-details/TasksList";
import { MessageCircle, Pencil, XCircle } from "lucide-react";
import { TaskDialogsProvider } from "@/components/tasks/components/dialogs/TaskDialogsProvider";
import { EditTaskDialog } from "./EditTaskDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MeetingTasksSectionProps {
  meetingId: string;
}

// Adapter function to convert MeetingTask to Task format
const adaptMeetingTaskToTask = (meetingTask: MeetingTask): Task => {
  return {
    id: meetingTask.id,
    title: meetingTask.title,
    description: meetingTask.description || null,
    status: meetingTask.status,
    priority: meetingTask.priority || "medium", // Ensure priority is set
    due_date: meetingTask.due_date || null,
    assigned_to: meetingTask.assigned_to || null,
    created_at: meetingTask.created_at || new Date().toISOString(),
    is_general: false,
    requires_deliverable: meetingTask.requires_deliverable || false,
    project_id: null,
    project_name: null
  };
};

export const MeetingTasksSection: React.FC<MeetingTasksSectionProps> = ({ meetingId }) => {
  const { data: tasks, isLoading, error, refetch } = useMeetingTasks(meetingId);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<MeetingTask | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenDialog = () => {
    setIsAddTaskOpen(true);
  };

  // Handle task status changes
  const handleStatusChange = async (taskId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('meeting_tasks')
        .update({ status })
        .eq('id', taskId);
        
      if (error) throw error;
      
      refetch();
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

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
        refetch();
      } catch (error) {
        console.error('Error deleting task:', error);
        toast.error("حدث خطأ أثناء حذف المهمة");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Convert meeting tasks to Task format for TasksList component
  const adaptedTasks = tasks ? tasks.map(adaptMeetingTaskToTask) : [];

  // Custom render function for task actions
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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Button size="sm" onClick={handleOpenDialog} className="flex items-center">
          <Plus className="h-4 w-4 ml-2" />
          إضافة مهمة
        </Button>
        <h3 className="text-lg font-semibold">مهام الاجتماع</h3>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>قائمة المهام</CardTitle>
        </CardHeader>
        <CardContent>
          <TasksList 
            projectId={meetingId} // Using meetingId as projectId for data tracking
            isWorkspace={false}
            customTasks={adaptedTasks}
            customLoading={isLoading}
            customError={error as any}
            customRefetch={refetch}
            customRenderTaskActions={renderTaskActions}
            onCustomStatusChange={handleStatusChange}
          />
        </CardContent>
      </Card>

      <CustomEnhancedTaskDialog
        open={isAddTaskOpen}
        onOpenChange={setIsAddTaskOpen}
        meetingId={meetingId}
        onSuccess={refetch}
      />
      
      {selectedTask && (
        <TaskDialogsProvider 
          task={selectedTask}
          onStatusChange={handleStatusChange}
          onTaskUpdated={refetch}
          initialDialog="discussion"
        />
      )}
      
      {taskToEdit && (
        <EditTaskDialog
          meetingId={meetingId}
          task={taskToEdit}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSuccess={refetch}
        />
      )}
    </div>
  );
};
