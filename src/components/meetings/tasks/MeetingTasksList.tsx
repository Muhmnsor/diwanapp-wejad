
import React, { useState } from "react";
import { TasksList as BaseTasksList } from "@/components/tasks/TasksList";
import { Task } from "@/components/tasks/types/task";
import { TaskDialogsProvider } from "@/components/tasks/components/dialogs/TaskDialogsProvider";

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

  return (
    <>
      <BaseTasksList 
        tasks={tasks} 
        isLoading={isLoading} 
        error={error} 
        onTasksChange={onTasksChange}
        meetingId={meetingId}
        onStatusChange={onStatusChange}
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
