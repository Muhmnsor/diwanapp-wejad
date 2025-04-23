
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Task } from "../types/task";

interface ReorderParams {
  activeId: string;
  overId: string;
  tasks: Task[];
}

export const useTaskReorder = (stageId: string) => {
  const [isReordering, setIsReordering] = useState(false);

  const reorderTasks = async ({ tasks, activeId, overId }: ReorderParams) => {
    setIsReordering(true);
    try {
      const oldIndex = tasks.findIndex(t => t.id === activeId);
      const newIndex = tasks.findIndex(t => t.id === overId);
      
      if (oldIndex === -1 || newIndex === -1) throw new Error("Task not found");
      
      // إعادة ترتيب المصفوفة
      const orderedTasks = [...tasks];
      const [movedTask] = orderedTasks.splice(oldIndex, 1);
      orderedTasks.splice(newIndex, 0, movedTask);
      
      // تحديث order_position لكل المهام
      const updates = orderedTasks.map((task, index) => ({
        id: task.id,
        order_position: index
      }));
      
      const { error } = await supabase
        .from('tasks')
        .upsert(updates, { onConflict: 'id' });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error reordering tasks:', error);
      return false;
    } finally {
      setIsReordering(false);
    }
};


  return {
    isReordering,
    reorderTasks
  };
};
