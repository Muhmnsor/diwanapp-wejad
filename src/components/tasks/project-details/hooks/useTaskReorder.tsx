// src/components/tasks/project-details/hooks/useTaskReorder.tsx

import { useState } from 'react';
import { Task } from "../types/task";
import { supabase } from "@/integrations/supabase/client";

// إضافة ثوابت النظام
const REINDEX_THRESHOLD = 1.0; // الحد الأدنى للفرق بين الترتيبين
const BASE_ORDER_MULTIPLIER = 1000; // المضاعف الأساسي للترتيب
const LOCAL_REINDEX_RANGE = 10; // عدد المهام المحيطة للترقيم المحلي

interface ReorderParams {
  tasks: Task[];
  activeId: string;
  overId: string;
  activeStageId?: string;  // إضافة معرف المرحلة النشطة
  overStageId?: string;    // إضافة معرف المرحلة المستهدفة
}

const emitDebugEvent = (debugInfo: {
  draggedTask: Task | null;
  sourcePosition: number | null;
  targetPosition: number | null;
  status: string;
  error: string | null;
}) => {
  console.log("Emitting debug event:", debugInfo);
  // التأكد من أننا في بيئة المتصفح قبل إرسال الحدث
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('dragDebugUpdate', { detail: debugInfo });
    window.dispatchEvent(event);
  }
};

// إضافة وظيفة حساب الترتيب الجديد
const calculateNewOrder = (prevOrder: number | null, nextOrder: number | null): number => {
  if (prevOrder === null && nextOrder === null) return BASE_ORDER_MULTIPLIER; // أول عنصر في قائمة فارغة
  if (prevOrder === null) return (nextOrder as number) / 2; // قبل أول عنصر
  if (nextOrder === null) return (prevOrder as number) + BASE_ORDER_MULTIPLIER; // بعد آخر عنصر
  return (prevOrder as number) + ((nextOrder as number) - (prevOrder as number)) / 2; // بين عنصرين
};


// إضافة وظيفة الترقيم المحلي
const reindexLocalTasks = (tasks: Task[], startIndex: number, endIndex: number) => {
  // إنشاء نسخة جديدة للمهام التي سيتم إعادة ترقيمها
  const tasksToReindex = tasks.slice(startIndex, endIndex + 1).map(task => ({ ...task }));

  // تطبيق الترقيم الجديد
  tasksToReindex.forEach((task, index) => {
    task.order_position = (startIndex + index + 1) * BASE_ORDER_MULTIPLIER;
  });

  // دمج المهام التي تم إعادة ترقيمها مع بقية المهام
  const newTasks = [...tasks];
  newTasks.splice(startIndex, tasksToReindex.length, ...tasksToReindex);

  return newTasks;
};


export const useTaskReorder = (projectId: string) => {
  const [isReordering, setIsReordering] = useState(false);

  const reorderTasks = ({ tasks, activeId, overId, activeStageId, overStageId }: ReorderParams) => {
    // التحقق من وجود إعادة ترتيب بين المراحل
    const crossStage = activeStageId && overStageId && activeStageId !== overStageId;

    const oldIndex = tasks.findIndex(t => t.id === activeId);
    const newIndex = tasks.findIndex(t => t.id === overId);

    const draggedTask = tasks.find(t => t.id === activeId) || null;

    if (oldIndex === -1 || newIndex === -1) {
      emitDebugEvent({
        draggedTask,
        sourcePosition: oldIndex === -1 ? null : oldIndex + 1,
        targetPosition: newIndex === -1 ? null : newIndex + 1,
        status: 'error',
        error: 'Invalid source or target position'
      });
      return null;
    }

    // Log reordering attempt
    console.log(`Reordering task from index ${oldIndex} to index ${newIndex}`);
    if (crossStage) {
      console.log(`Moving across stages: ${activeStageId} -> ${overStageId}`);
    }
    console.log("Task being moved:", draggedTask);

    const reorderedTasksDraft = [...tasks];
    const [movedTask] = reorderedTasksDraft.splice(oldIndex, 1);

    // تحديث المرحلة إذا تم السحب بين المراحل
    if (crossStage) {
      movedTask.stage_id = overStageId;
    }

    reorderedTasksDraft.splice(newIndex, 0, movedTask);

    // حساب الترتيب الجديد
    const prevTask = newIndex > 0 ? reorderedTasksDraft[newIndex - 1] : null;
    const nextTask = newIndex < reorderedTasksDraft.length - 1 ? reorderedTasksDraft[newIndex + 1] : null;

    const prevOrder = prevTask?.order_position || null;
    const nextOrder = nextTask?.order_position || null;

    const newOrder = calculateNewOrder(prevOrder, nextOrder);

    let finalReorderedTasks = [...reorderedTasksDraft];

    // التحقق من الحاجة للترقيم المحلي
    if (prevOrder !== null && nextOrder !== null && (nextOrder - prevOrder) < REINDEX_THRESHOLD) {
      console.log(`Order difference (${nextOrder - prevOrder}) below threshold (${REINDEX_THRESHOLD}). Performing local re-index.`);
      const startIndex = Math.max(0, newIndex - LOCAL_REINDEX_RANGE);
      const endIndex = Math.min(reorderedTasksDraft.length - 1, newIndex + LOCAL_REINDEX_RANGE);

      finalReorderedTasks = reindexLocalTasks(reorderedTasksDraft, startIndex, endIndex);

      console.log(`Local re-index performed from index ${startIndex} to ${endIndex}`);
    } else {
      // تحديث ترتيب المهمة المسحوبة فقط إذا لم يتم إجراء ترقيم محلي شامل
      const movedTaskInFinal = finalReorderedTasks.find(t => t.id === movedTask.id);
      if(movedTaskInFinal) {
        movedTaskInFinal.order_position = newOrder;
      }
    }

    // تحديث معلومات التصحيح أثناء إعادة الترتيب
    emitDebugEvent({
      draggedTask: movedTask,
      sourcePosition: oldIndex + 1,
      targetPosition: newIndex + 1,
      status: 'reordering',
      error: null
    });

    return finalReorderedTasks;
  };

  const updateTasksOrder = async (reorderedTasks: Task[]) => {
    try {
      setIsReordering(true);

      // بدء عملية التحديث
      emitDebugEvent({
        draggedTask: null,
        sourcePosition: null,
        targetPosition: null,
        status: 'updating',
        error: null
      });

      if (!reorderedTasks || reorderedTasks.length === 0) {
        console.log("No tasks provided for update.");
        emitDebugEvent({
            draggedTask: null,
            sourcePosition: null,
            targetPosition: null,
            status: 'idle',
            error: 'No tasks to update'
        });
        return null;
      }

      console.log("Preparing updates for tasks");

      // إعداد التحديثات للخلفية
      // نحدث فقط المهام التي قد تكون تغيرت
      const updates = reorderedTasks
        .filter(task => typeof task.order_position === 'number') // فقط المهام التي لديها order_position محددة
        .map(task => ({
          id: task.id,
          order_position: task.order_position,
          project_id: projectId,
          stage_id: task.stage_id, // إضافة stage_id للتحديث
          updated_at: new Date().toISOString()
        }));

      if (updates.length === 0) {
        console.log("No tasks with updated order_position to send.");
          emitDebugEvent({
          draggedTask: null,
          sourcePosition: null,
          targetPosition: null,
          status: 'idle',
          error: 'No tasks with updated order position to send'
        });
        return null;
      }

      console.log(`Sending ${updates.length} updates to Supabase.`);

      // تنفيذ التحديث الفعلي ضد Supabase
      const { data, error } = await supabase
        .from('tasks')
        .upsert(updates, { onConflict: 'id' });

      if (error) {
        console.error("Error updating task order:", error);
        emitDebugEvent({
          draggedTask: null,
          sourcePosition: null,
          targetPosition: null,
          status: 'error',
          error: error.message
        });
        return null;
      }

      console.log("Task order updated successfully:", data);
      emitDebugEvent({
        draggedTask: null,
        sourcePosition: null,
        targetPosition: null,
        status: 'success',
        error: null
      });

      return updates; // يمكنك إرجاع updates أو data حسب الحاجة
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error updating task order:', errorMessage);

      emitDebugEvent({
        draggedTask: null,
        sourcePosition: null,
        targetPosition: null,
        status: 'error',
        error: errorMessage
      });

      return null;
    } finally {
      setIsReordering(false);
    }
  };

  // Clean up debug overlay when needed
  const clearDebugInfo = () => {
    emitDebugEvent({
      draggedTask: null,
      sourcePosition: null,
      targetPosition: null,
      status: 'idle',
      error: null
    });
  };

  return {
    reorderTasks,
    updateTasksOrder,
    isReordering,
    clearDebugInfo
  };
};
