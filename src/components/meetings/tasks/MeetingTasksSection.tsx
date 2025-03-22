
import { useState } from "react";
import { useMeetingTasks } from "@/hooks/meetings/useMeetingTasks";
import { AddTaskDialog } from "./AddTaskDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Task } from "@/components/tasks/types/task";
import { MeetingTask } from "@/types/meeting";
import { TasksList } from "@/components/tasks/project-details";

interface MeetingTasksSectionProps {
  meetingId: string;
}

// Helper function to convert MeetingTask to Task
const convertMeetingTasksToTasks = (meetingTasks: MeetingTask[]): Task[] => {
  return meetingTasks.map(meetingTask => ({
    id: meetingTask.id,
    title: meetingTask.title,
    description: meetingTask.description || null,
    status: meetingTask.status || "pending",
    priority: "medium", // Default priority since meeting tasks don't have priority
    due_date: meetingTask.due_date || null,
    assigned_to: meetingTask.assigned_to || null,
    created_at: meetingTask.created_at || new Date().toISOString(),
    meeting_id: meetingTask.meeting_id
  }));
};

export const MeetingTasksSection = ({ meetingId }: MeetingTasksSectionProps) => {
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const { data: meetingTasks, isLoading, error, refetch } = useMeetingTasks(meetingId);
  
  // Convert meeting tasks to the format expected by TasksList
  const tasks = meetingTasks ? convertMeetingTasksToTasks(meetingTasks) : [];

  const handleOpenAddTask = () => {
    setIsAddTaskOpen(true);
  };

  const handleTaskAdded = () => {
    refetch();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">المهام</h3>
        <Button 
          onClick={handleOpenAddTask} 
          className="rtl"
          size="sm"
        >
          <Plus className="h-4 w-4 ml-2" />
          إضافة مهمة جديدة
        </Button>
      </div>

      <TasksList 
        isLoading={isLoading} 
        error={error instanceof Error ? error : null}
        onTasksChange={() => refetch()}
        hideAddButton={true}
        externalTasks={tasks}
        meetingId={meetingId}
      />

      <AddTaskDialog 
        meetingId={meetingId}
        open={isAddTaskOpen}
        onOpenChange={setIsAddTaskOpen}
        onSuccess={handleTaskAdded}
      />
    </div>
  );
};
