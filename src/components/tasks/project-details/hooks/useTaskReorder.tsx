
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
      console.log("Reordering tasks for stage:", stageId);
      console.log("Tasks to reorder:", tasks);
      
      // Update order_position for each task
      const updates = tasks.map((task, index) => ({
        id: task.id,
        order_position: index + 1,
        stage_id: stageId
      }));

      console.log("Updates to be sent to database:", updates);

      const { error, data } = await supabase
        .from('tasks')
        .upsert(updates);

      if (error) {
        console.error("Error in upsert operation:", error);
        throw error;
      }
      
      console.log("Reordering successful, response:", data);
      toast.success("تم إعادة ترتيب المهام بنجاح");
      
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
