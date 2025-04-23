
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
      const activeTask = tasks.find(t => t.id === activeId);
      if (!activeTask) throw new Error("Task not found");

      const newIndex = tasks.findIndex(t => t.id === overId);
      if (newIndex === -1) throw new Error("Target position not found");

      // Create an array of all affected tasks with their new positions
      const updatedTasks = tasks.map((task, index) => {
        if (task.id === activeId) {
          // Moving task gets the target position
          return { id: task.id, order_position: newIndex };
        }
        // Shift other tasks accordingly
        if (index >= newIndex) {
          return { id: task.id, order_position: index + 1 };
        }
        return { id: task.id, order_position: index };
      });

      const { error } = await supabase
        .from('tasks')
        .upsert(updatedTasks, { onConflict: 'id' });

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
