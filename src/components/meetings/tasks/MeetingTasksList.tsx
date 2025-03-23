
import React, { useState } from "react";
import { TasksList as BaseTasksList } from "@/components/tasks/TasksList";
import { Task } from "@/components/tasks/types/task";
import { TaskDialogsProvider } from "@/components/tasks/components/dialogs/TaskDialogsProvider";
import { MeetingTask } from "@/types/meeting";
import { MeetingTaskItem } from "./MeetingTaskItem";
import { TaskDiscussionDialog } from "@/components/tasks/components/TaskDiscussionDialog";

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
  const [meetingTasks, setMeetingTasks] = useState<MeetingTask[]>([]);
  
  // Load meeting tasks data
  React.useEffect(() => {
    const loadMeetingTasks = async () => {
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        
        const { data, error } = await supabase
          .from('meeting_tasks')
          .select('*')
          .eq('meeting_id', meetingId);
          
        if (error) throw error;
        
        setMeetingTasks(data);
      } catch (err) {
        console.error('Error loading meeting tasks:', err);
      }
    };
    
    if (meetingId) {
      loadMeetingTasks();
    }
  }, [meetingId, tasks]);
  
  // Show custom rendering for meeting tasks with discussion buttons
  if (isLoading) {
    return <div className="py-4">جاري التحميل...</div>;
  }
  
  if (error) {
    return <div className="text-red-500 py-4">حدث خطأ: {error.message}</div>;
  }
  
  if (!tasks || tasks.length === 0) {
    return <div className="text-muted-foreground py-4">لا توجد مهام لهذا الاجتماع.</div>;
  }
  
  return (
    <div className="space-y-4">
      {tasks.map(task => {
        // Find the corresponding meeting task
        const meetingTask = meetingTasks.find(mt => mt.id === task.id);
        
        if (!meetingTask) {
          return null;
        }
        
        return (
          <MeetingTaskItem 
            key={task.id}
            task={task}
            meetingTask={meetingTask}
            onStatusChange={onStatusChange}
            onTaskUpdated={onTasksChange}
          />
        );
      })}
      
      {selectedTask && (
        <TaskDialogsProvider 
          task={selectedTask}
          onStatusChange={onStatusChange}
          onTaskUpdated={onTasksChange}
        />
      )}
    </div>
  );
};
