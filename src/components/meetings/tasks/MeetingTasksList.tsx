
import React, { useState } from "react";
import { TasksList as BaseTasksList } from "@/components/tasks/TasksList";
import { Task } from "@/components/tasks/types/task";
import { TaskDialogsProvider } from "@/components/tasks/components/dialogs/TaskDialogsProvider";
import { MeetingTask } from "@/types/meeting";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  // Add a function to open the discussion dialog when the button is clicked
  const handleOpenDiscussion = (task: Task) => {
    console.log("Opening discussion for task:", task);
    setSelectedTask(task);
  };

  // Custom render function for the task actions column
  const renderTaskActions = (task: Task) => {
    return (
      <div className="flex items-center justify-end gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0" 
          onClick={(e) => {
            e.stopPropagation();
            handleOpenDiscussion(task);
          }}
          title="مناقشة المهمة"
        >
          <MessageCircle className="h-4 w-4" />
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
        />
      )}
    </>
  );
};
