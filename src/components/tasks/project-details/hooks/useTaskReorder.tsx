
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
  const [lastError, setLastError] = useState<string | null>(null);
  const [reorderStatus, setReorderStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const reorderTasks = async ({ tasks, activeId, overId }: ReorderParams) => {
    if (!projectId) return { success: false, tasks: tasks, error: "No project ID provided" };
    
    setIsReordering(true);
    setReorderStatus('loading');
    setLastError(null);
    
    try {
      console.log('Reordering tasks:', { activeId, overId });
      
      // Find old and new positions
      const oldIndex = tasks.findIndex(t => t.id === activeId);
      const newIndex = tasks.findIndex(t => t.id === overId);
      
      if (oldIndex === -1 || newIndex === -1) {
        const error = `Task not found: ${oldIndex === -1 ? activeId : overId}`;
        console.error('Task not found:', { oldIndex, newIndex });
        setLastError(error);
        setReorderStatus('error');
        throw new Error(error);
      }

      console.log('Task positions:', { oldIndex, newIndex });

      // Create optimistic update
      const updatedTasks = [...tasks];
      const [movedTask] = updatedTasks.splice(oldIndex, 1);
      updatedTasks.splice(newIndex, 0, movedTask);

      // Log the reordered tasks
      console.log('Reordered tasks:', updatedTasks.map(t => ({ id: t.id, position: t.order_position })));

      // Apply optimistic update
      setOptimisticTasks(updatedTasks);

      // Prepare database updates with new order positions
      const updates = updatedTasks.map((task, index) => ({
        id: task.id,
        order_position: index + 1,
        project_id: projectId,
        stage_id: task.stage_id,
        updated_at: new Date().toISOString(),
        title: task.title // Ensure title is included as it's required
      }));

      console.log('Preparing database updates:', updates);

      // Update database
      const { error } = await supabase
        .from('tasks')
        .upsert(updates, { 
          onConflict: 'id',
          ignoreDuplicates: false
        });

      if (error) {
        console.error('خطأ في إعادة الترتيب:', error);
        // Rollback optimistic update on error
        setOptimisticTasks([]);
        setLastError(JSON.stringify(error));
        setReorderStatus('error');
        // Show error toast
        toast.error("فشل في إعادة ترتيب المهام");
        throw error;
      }

      console.log('Database update successful');
      setReorderStatus('success');
      return { success: true, tasks: updatedTasks };

    } catch (error) {
      console.error('Reorder error:', error);
      setReorderStatus('error');
      setLastError(error.message || JSON.stringify(error));
      toast.error("فشل في إعادة ترتيب المهام");
      return { success: false, tasks: tasks, error };
    } finally {
      setIsReordering(false);
      // Clear optimistic updates after a delay to show the success/failure state
      setTimeout(() => {
        setOptimisticTasks([]);
        setReorderStatus('idle');
      }, 2000);
    }
  };

  return {
    reorderTasks,
    isReordering,
    optimisticTasks,
    lastError,
    reorderStatus
  };
};
