
import React, { useState } from "react";
import { TasksList as BaseTasksList } from "@/components/tasks/TasksList";
import { Task } from "@/components/tasks/types/task";
import { TaskDialogsProvider } from "@/components/tasks/components/dialogs/TaskDialogsProvider";
import { MeetingTask } from "@/types/meeting";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

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

  const handleOpenDiscussion = (task: Task) => {
    setSelectedTask(task);
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
    </>
  );
};
