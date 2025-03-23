
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useMeetingTasks } from "@/hooks/meetings/useMeetingTasks";
import { useState } from "react";
import { CustomEnhancedTaskDialog } from "./CustomEnhancedTaskDialog";
import { Task } from "@/components/tasks/types/task";
import { MeetingTask } from "@/types/meeting";
import { MeetingTasksList } from "./MeetingTasksList";
import { useUpdateMeetingTask } from "@/hooks/meetings/useUpdateMeetingTask";
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
    project_name: null,
    assigned_user_name: meetingTask.assigned_user_name,
    general_task_id: meetingTask.general_task_id
  };
};

export const MeetingTasksSection: React.FC<MeetingTasksSectionProps> = ({ meetingId }) => {
  const { data: tasks, isLoading, error, refetch } = useMeetingTasks(meetingId);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const { mutate: updateMeetingTask } = useUpdateMeetingTask();

  const handleOpenDialog = () => {
    setIsAddTaskOpen(true);
  };

  // Enhanced handler for task status changes with bidirectional sync
  const handleStatusChange = async (taskId: string, status: string) => {
    try {
      const task = tasks?.find(t => t.id === taskId);
      if (!task) {
        throw new Error("Task not found");
      }
      
      // Use the updateMeetingTask hook to handle bidirectional sync
      updateMeetingTask({
        id: taskId,
        meeting_id: meetingId,
        updates: { status: status as any }
      }, {
        onSuccess: () => {
          // The hook will handle bidirectional sync and cache invalidation
          console.log("Successfully updated task status with sync");
        },
        onError: (error) => {
          console.error("Error updating task status:", error);
          toast.error("حدث خطأ أثناء تحديث حالة المهمة");
        }
      });
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error("حدث خطأ أثناء تحديث حالة المهمة");
    }
  };

  // Convert meeting tasks to Task format for TasksList component
  const adaptedTasks = tasks ? tasks.map(adaptMeetingTaskToTask) : [];

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
          <MeetingTasksList 
            tasks={adaptedTasks} 
            isLoading={isLoading} 
            error={error} 
            onTasksChange={refetch}
            meetingId={meetingId}
            onStatusChange={handleStatusChange}
          />
        </CardContent>
      </Card>

      <CustomEnhancedTaskDialog
        open={isAddTaskOpen}
        onOpenChange={setIsAddTaskOpen}
        meetingId={meetingId}
        onSuccess={refetch}
      />
    </div>
  );
};
