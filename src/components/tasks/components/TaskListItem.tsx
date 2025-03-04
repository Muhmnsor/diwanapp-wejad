
import { useState } from "react";
import { 
  MessageCircle,
  Check,
  Clock,
  CalendarClock,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Task } from "../types/task";
import { TaskDiscussionDialog } from "./TaskDiscussionDialog";
import { TaskHeader } from "./header/TaskHeader";
import { TaskMetadata } from "./metadata/TaskMetadata";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TaskListItemProps {
  task: Task;
  onStatusChange: (taskId: string, status: string) => void;
  onDelete?: (taskId: string) => void;
}

export const TaskListItem = ({ task, onStatusChange, onDelete }: TaskListItemProps) => {
  const [showDiscussion, setShowDiscussion] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const currentStatus = task.status || "pending";

  // Custom function to handle status change
  const handleStatusChange = async (status: string) => {
    setIsUpdating(true);
    try {
      // Check if the task is a subtask and use the correct table
      if (task.is_subtask) {
        const { error } = await supabase
          .from('subtasks')
          .update({ status })
          .eq('id', task.id);
          
        if (error) throw error;
        
        // We need to call the onStatusChange to update the UI
        onStatusChange(task.id, status);
        toast.success('تم تحديث حالة المهمة الفرعية');
      } else {
        // Regular tasks use the parent component's handler
        onStatusChange(task.id, status);
      }
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error('حدث خطأ أثناء تحديث حالة المهمة');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <Check className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-amber-500" />;
      case "delayed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <CalendarClock className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="bg-card hover:bg-accent/5 border rounded-lg p-4 transition-colors">
      <TaskHeader task={task} status={currentStatus} />
      
      <div className="mt-3">
        <TaskMetadata
          dueDate={task.due_date}
          projectName={task.project_name}
          isSubtask={!!task.parent_task_id}
          parentTaskId={task.parent_task_id}
        />
      </div>
      
      <div className="flex justify-between items-center mt-3 pt-3 border-t">
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground"
            onClick={() => setShowDiscussion(true)}
          >
            <MessageCircle className="h-3.5 w-3.5" />
            مناقشة
          </Button>
        </div>
        
        <div className="flex gap-2">
          {currentStatus !== "completed" ? (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs flex items-center gap-1"
              onClick={() => handleStatusChange("completed")}
              disabled={isUpdating}
            >
              <Check className="h-3.5 w-3.5 text-green-500" />
              تمت
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs flex items-center gap-1"
              onClick={() => handleStatusChange("pending")}
              disabled={isUpdating}
            >
              <Clock className="h-3.5 w-3.5 text-amber-500" />
              قيد التنفيذ
            </Button>
          )}
          
          {onDelete && (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs flex items-center gap-1 text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={() => onDelete(task.id)}
            >
              <XCircle className="h-3.5 w-3.5" />
              حذف
            </Button>
          )}
        </div>
      </div>
      
      <TaskDiscussionDialog 
        open={showDiscussion} 
        onOpenChange={setShowDiscussion}
        task={task}
      />
    </div>
  );
};
