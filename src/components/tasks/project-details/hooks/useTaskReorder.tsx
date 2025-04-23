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

  const reorderTasks = async ({ tasks, activeId, overId }: ReorderParams) => {
    setIsReordering(true);
    
    try {
      // 1. إيجاد المواقع القديمة والجديدة
      const oldIndex = tasks.findIndex(t => t.id === activeId);
      const newIndex = tasks.findIndex(t => t.id === overId);
      
      if (oldIndex === -1 || newIndex === -1) {
        throw new Error("لم يتم العثور على المهمة");
      }

      // 2. إعادة ترتيب المصفوفة محليًا
      const reorderedTasks = [...tasks];
      const [movedTask] = reorderedTasks.splice(oldIndex, 1);
      reorderedTasks.splice(newIndex, 0, movedTask);

      // 3. إنشاء مصفوفة من التحديثات مع الترتيب الجديد
      const updates = reorderedTasks.map((task, index) => ({
        id: task.id,
        order_position: index + 1
      }));

      // 4. تحديث قاعدة البيانات
      const { error } = await supabase
        .from('tasks')
        .upsert(
          updates.map(u => ({
            id: u.id,
            order_position: u.order_position,
            updated_at: new Date().toISOString()
          }))
        );

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('خطأ في إعادة الترتيب:', error);
      return false;
    } finally {
      setIsReordering(false);
    }
  };

  return {
    reorderTasks,
    isReordering
  };
};
