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
      const oldIndex = tasks.findIndex(t => t.id === activeId);
      const newIndex = tasks.findIndex(t => t.id === overId);

      if (oldIndex === -1 || newIndex === -1) {
        throw new Error("تعذر العثور على المهام المحددة لإعادة الترتيب");
      }

      // إعادة ترتيب المهام محليًا
      const updatedTasks = [...tasks];
      const [movedTask] = updatedTasks.splice(oldIndex, 1);
      updatedTasks.splice(newIndex, 0, movedTask);

      // إعداد البيانات للتحديث في Supabase
      const updates = updatedTasks.map((task, index) => ({
        id: task.id,
        order_position: index + 1,
        stage_id: stageId
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
