
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Task } from "../types/task";

interface ReorderParams {
  tasks: Task[];
  activeId: string; 
  overId: string;
}

export const useTaskReorder = (projectId: string) => {
  const [isReordering, setIsReordering] = useState(false);

  const updateTasksOrder = async (reorderedTasks: Task[]) => {
    try {
      // Backend update with new order
      const updates = reorderedTasks.map((task, index) => ({
        id: task.id,
        order_position: index + 1,
        project_id: projectId,
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('tasks')
        .upsert(updates);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('خطأ في تحديث الترتيب:', error);
      return false;
    } finally {
      setIsReordering(false);
    }
  };

  const reorderTasks = ({ tasks, activeId, overId }: ReorderParams) => {
    // Frontend reordering
    const oldIndex = tasks.findIndex(t => t.id === activeId);
    const newIndex = tasks.findIndex(t => t.id === overId);
    
    if (oldIndex === -1 || newIndex === -1) {
      return null;
    }

    const reorderedTasks = [...tasks];
    const [movedTask] = reorderedTasks.splice(oldIndex, 1);
    reorderedTasks.splice(newIndex, 0, movedTask);

    return reorderedTasks;
  };

  return {
    reorderTasks,
    updateTasksOrder,
    isReordering
  };
};
