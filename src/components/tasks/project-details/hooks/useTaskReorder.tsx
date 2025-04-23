import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Task } from "../types/task";
import { toast } from 'sonner';

interface ReorderParams {
  tasks: Task[];
  activeId: string; 
  overId: string;
}

export const useTaskReorder = (projectId: string) => {
  const [isReordering, setIsReordering] = useState(false);
  const [optimisticTasks, setOptimisticTasks] = useState<Task[]>([]);

  const reorderTasks = async ({ tasks, activeId, overId }: ReorderParams) => {
    if (!projectId) return { success: false, tasks: tasks };
    setIsReordering(true);
    
    try {
      // Find old and new positions
      const oldIndex = tasks.findIndex(t => t.id === activeId);
      const newIndex = tasks.findIndex(t => t.id === overId);
      
      if (oldIndex === -1 || newIndex === -1) {
        throw new Error("Task not found");
      }

      // Create optimistic update
      const updatedTasks = [...tasks];
      const [movedTask] = updatedTasks.splice(oldIndex, 1);
      updatedTasks.splice(newIndex, 0, movedTask);

      // Apply optimistic update
      setOptimisticTasks(updatedTasks);

      // Prepare database updates
      const updates = updatedTasks.map((task, index) => ({
        id: task.id,
        order_position: index + 1,
        project_id: projectId,
        updated_at: new Date().toISOString()
      }));

      // Update database
      const { error } = await supabase
        .from('tasks')
        .upsert(updates);

      if (error) {
        // Rollback optimistic update on error
        setOptimisticTasks(tasks);
        throw error;
      }

      return { success: true, tasks: updatedTasks };

    } catch (error) {
      console.error('Reorder error:', error);
      toast.error("Failed to reorder tasks");
      return { success: false, tasks: tasks };
    } finally {
      setIsReordering(false);
    }
  };

  return {
    reorderTasks,
    isReordering,
    optimisticTasks
  };
};
