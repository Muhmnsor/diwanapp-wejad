
import { useState, useEffect } from "react";
import { Task } from "./types/task";
import { useAssignedTasks } from "./hooks/useAssignedTasks";
import { TaskListItem } from "./components/TaskListItem";
import { TasksLoadingState } from "./components/TasksLoadingState";
import { TasksEmptyState } from "./components/TasksEmptyState";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Paperclip } from "lucide-react";
import { TaskAttachmentDialog } from "./components/dialogs/TaskAttachmentDialog";

export const AssignedTasksList = () => {
  const { tasks, loading, error, refetch } = useAssignedTasks();
  const [showCompleted, setShowCompleted] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isAttachmentDialogOpen, setIsAttachmentDialogOpen] = useState(false);
  
  const handleStatusChange = async (taskId: string, status: string) => {
    try {
      // التحقق من الجدول المناسب للمهمة
      const task = tasks.find(t => t.id === taskId);
      
      if (!task) return;
      
      if (task.is_subtask) {
        // If it's a subtask, update in the subtasks table
        const { error } = await supabase
          .from('subtasks')
          .update({ status })
          .eq('id', taskId);
          
        if (error) throw error;
      } else {
        // For regular tasks or portfolio tasks
        const isPortfolioTask = task.workspace_id ? true : false;
        const tableName = isPortfolioTask ? 'portfolio_tasks' : 'tasks';
        
        const { error } = await supabase
          .from(tableName)
          .update({ status })
          .eq('id', taskId);
            
        if (error) throw error;
      }
      
      // تحديث القائمة
      refetch();
      
      toast.success('تم تحديث حالة المهمة');
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error('حدث خطأ أثناء تحديث حالة المهمة');
    }
  };
  
  const openAttachmentsDialog = (task: Task) => {
    setSelectedTask(task);
    setIsAttachmentDialogOpen(true);
  };
  
  if (loading) {
    return <TasksLoadingState />;
  }
  
  if (error || tasks.length === 0) {
    return <TasksEmptyState message="لا توجد لديك مهام مسندة حالياً" />;
  }
  
  // Filter out completed tasks unless showCompleted is true
  const filteredTasks = tasks.filter(task => showCompleted || task.status !== 'completed');
  
  // If there are no tasks after filtering
  if (filteredTasks.length === 0) {
    return (
      <>
        <div className="flex justify-end mb-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowCompleted(!showCompleted)}
            className="text-xs"
          >
            {showCompleted ? 'إخفاء المهام المكتملة' : 'إظهار المهام المكتملة'}
          </Button>
        </div>
        <TasksEmptyState message="لا توجد لديك مهام قيد التنفيذ" />
      </>
    );
  }
  
  return (
    <>
      <div className="flex justify-end mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowCompleted(!showCompleted)}
          className="text-xs"
        >
          {showCompleted ? 'إخفاء المهام المكتملة' : 'إظهار المهام المكتملة'}
        </Button>
      </div>
      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <div key={task.id}>
            <TaskListItem 
              key={task.id} 
              task={task} 
              onStatusChange={handleStatusChange}
            />
            {/* Add attachment button for each task (won't modify protected component) */}
            <div className="mt-1 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-gray-500"
                onClick={() => openAttachmentsDialog(task)}
              >
                <Paperclip className="h-3 w-3 ml-1" />
                المرفقات
              </Button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Attachment dialog */}
      {selectedTask && (
        <TaskAttachmentDialog
          task={selectedTask}
          open={isAttachmentDialogOpen}
          onOpenChange={setIsAttachmentDialogOpen}
        />
      )}
    </>
  );
};
