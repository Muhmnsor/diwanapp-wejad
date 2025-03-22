
import { useState } from "react";
import { TasksList } from "@/components/meetings/content";
import { useMeetingTasks } from "@/hooks/meetings/useMeetingTasks";
import { AddTaskDialog } from "./AddTaskDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface MeetingTasksSectionProps {
  meetingId: string;
}

export const MeetingTasksSection = ({ meetingId }: MeetingTasksSectionProps) => {
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const { data: tasks, isLoading, error, refetch } = useMeetingTasks(meetingId);

  const handleTaskAdded = () => {
    refetch();
  };

  console.log("MeetingTasksSection rendering with tasks:", tasks);
  console.log("Is Add Task Dialog Open:", isAddTaskOpen);

  const handleAddTaskClick = () => {
    console.log("Add Task button clicked");
    setIsAddTaskOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">المهام</h3>
        <Button onClick={handleAddTaskClick} className="rtl">
          <Plus className="h-4 w-4 ml-2" />
          إضافة مهمة جديدة
        </Button>
      </div>

      {/* Display the tasks list but don't include another Add Task button */}
      <TasksList 
        meetingId={meetingId}
      />

      {/* Ensure the dialog is correctly configured with the meetingId */}
      <AddTaskDialog 
        meetingId={meetingId}
        open={isAddTaskOpen}
        onOpenChange={setIsAddTaskOpen}
        onSuccess={handleTaskAdded}
      />
    </div>
  );
};
