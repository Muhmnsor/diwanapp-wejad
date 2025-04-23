import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Task } from "../types/task";
import { toast } from "sonner";

export const useTaskReorder = (stageId: string) => {
  const [isReordering, setIsReordering] = useState(false);

  const reorderTasks = async (tasks: Task[]) => {
    setIsReordering(true);
    if (!tasks.length) return false;
    try {
      // Update order_position for each task
      const updates = tasks.map((task, index) => ({
        id: task.id,
        order_position: index + 1
      }));

      const { error } = await supabase
        .from('tasks')
        .upsert(updates, { onConflict: 'id' });

      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error reordering tasks:', error);
      toast.error("حدث خطأ أثناء إعادة ترتيب المهام");
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

