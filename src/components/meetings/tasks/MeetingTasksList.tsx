
import React, { useState } from "react";
import { TasksList as BaseTasksList } from "@/components/tasks/TasksList";
import { Task } from "@/components/tasks/types/task";
import { TaskDialogsProvider } from "@/components/tasks/components/dialogs/TaskDialogsProvider";
import { MeetingTask } from "@/types/meeting";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

  // Function to handle opening the discussion dialog
  const handleOpenDiscussion = (task: Task) => {
    setSelectedTask(task);
  };

  // Function to render custom task actions (including discussion button)
  const renderTaskActions = (task: Task) => {
    return (
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0"
          onClick={(e) => {
            e.stopPropagation();
            handleOpenDiscussion(task);
          }}
        >
          <MessageCircle className="h-4 w-4" />
        </Button>
        
        <Badge 
          variant={getStatusVariant(task.status)}
          className="ml-2"
        >
          {getStatusText(task.status)}
        </Badge>
      </div>
    );
  };

  // Helper function to get badge variant based on status
  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" | "success" => {
    switch (status) {
      case "completed":
        return "success";
      case "in_progress":
        return "default";
      case "pending":
        return "secondary";
      case "canceled":
        return "destructive";
      default:
        return "outline";
    }
  };

  // Helper function to get status text
  const getStatusText = (status: string): string => {
    switch (status) {
      case "completed":
        return "مكتملة";
      case "in_progress":
        return "قيد التنفيذ";
      case "pending":
        return "قيد الانتظار";
      case "canceled":
        return "ملغية";
      default:
        return status;
    }
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
