
import React, { useState } from "react";
import { TasksList as BaseTasksList } from "@/components/tasks/TasksList";
import { Task } from "@/components/tasks/types/task";
import { TaskDialogsProvider } from "@/components/tasks/components/dialogs/TaskDialogsProvider";
import { MeetingTask } from "@/types/meeting";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  // فتح حوار المناقشة للمهمة المحددة
  const handleOpenDiscussion = (task: Task) => {
    setSelectedTask(task);
  };

  // تقديم أزرار الإجراءات المخصصة لكل مهمة
  const renderTaskActions = (task: Task) => {
    return (
      <div className="flex items-center gap-2 justify-end">
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
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
