import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Task } from "../types/task";
import { toast } from "sonner";

// ✅ تعريف type جديد للباراميترات المطلوبة
interface ReorderParams {
  activeId: string;
  overId: string;
  tasks: Task[];
}

export const useTaskReorder = (stageId: string) => {
  const [isReordering, setIsReordering] = useState(false);

  // ✅ تعديل دالة إعادة الترتيب لتستخدم ReorderParams
  const reorderTasks = async ({ tasks, activeId, overId }: ReorderParams) => {
    setIsReordering(true);
    try {
      // تعديل طريقة حساب الترتيب الجديد
      const updates = [{
        id: activeId,
        order_position: tasks.findIndex(t => t.id === overId)
      }];

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
