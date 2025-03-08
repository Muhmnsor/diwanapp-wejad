
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "../types/task";
import { toast } from "sonner";
import { useTaskDependencies } from "./useTaskDependencies";

export const useTaskStatusManagement = (
  projectId: string | undefined,
  tasks: Task[],
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>,
  tasksByStage: Record<string, Task[]>,
  setTasksByStage: React.Dispatch<React.SetStateAction<Record<string, Task[]>>>
) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { checkDependenciesCompleted } = useTaskDependencies("");

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    if (!taskId) return;
    
    setIsUpdating(true);
    try {
      // Find the current task
      const currentTask = tasks.find(task => task.id === taskId);
      
      if (!currentTask) {
        toast.error("لم يتم العثور على المهمة");
        setIsUpdating(false);
        return;
      }
      
      // Check if task requires deliverables and attempting to mark as completed
      if (newStatus === 'completed' && currentTask.requires_deliverable) {
        // Check if the task has any deliverables
        const { data: deliverables, error: deliverablesError } = await supabase
          .from('unified_task_attachments')
          .select('id')
          .eq('task_id', taskId)
          .eq('task_table', 'tasks')
          .eq('attachment_category', 'assignee')
          .limit(1);
          
        if (deliverablesError) {
          console.error("Error checking task deliverables:", deliverablesError);
          toast.error("حدث خطأ أثناء التحقق من مستلمات المهمة");
          setIsUpdating(false);
          return;
        }
        
        // If no deliverables found, prevent completion
        if (!deliverables || deliverables.length === 0) {
          toast.error("هذه المهمة تتطلب رفع مستلم واحد على الأقل للإكمال");
          setIsUpdating(false);
          return;
        }
      }
      
      // Check dependencies only when moving to "completed" status
      if (newStatus === 'completed') {
        // Check if all dependencies are completed before allowing status change
        const dependencyCheck = await checkDependenciesCompleted(taskId);
        
        if (!dependencyCheck.isValid) {
          toast.error(dependencyCheck.message);
          
          if (dependencyCheck.pendingDependencies.length > 0) {
            const pendingTasks = dependencyCheck.pendingDependencies
              .map(task => task.title)
              .join(", ");
            
            toast.error(`المهام المعلقة: ${pendingTasks}`);
          }
          
          setIsUpdating(false);
          return;
        }
      }

      // Update task status in database
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);
        
      if (error) throw error;
      
      // Update local state
      const updatedTasks = tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      );
      
      setTasks(updatedTasks);
      
      // Update tasks by stage - use the setter function directly
      setTasksByStage(prev => {
        const newTasksByStage = { ...prev };
        
        // Remove the task from all stage groups first
        Object.keys(newTasksByStage).forEach(stageId => {
          newTasksByStage[stageId] = newTasksByStage[stageId].filter(task => task.id !== taskId);
        });
        
        // Find the updated task
        const updatedTask = updatedTasks.find(task => task.id === taskId);
        
        // Add the task to the appropriate stage group if it exists
        if (updatedTask && updatedTask.stage_id) {
          if (!newTasksByStage[updatedTask.stage_id]) {
            newTasksByStage[updatedTask.stage_id] = [];
          }
          newTasksByStage[updatedTask.stage_id].push(updatedTask);
        }
        
        return newTasksByStage;
      });
      
      toast.success("تم تحديث حالة المهمة بنجاح");
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error("حدث خطأ أثناء تحديث حالة المهمة");
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    handleStatusChange,
    isUpdating
  };
};
