
import { useState } from 'react';
import { Task } from "../types/task";
import { supabase } from "@/integrations/supabase/client";

interface ReorderParams {
  tasks: Task[];
  activeId: string;
  overId: string;
}

const emitDebugEvent = (debugInfo: {
  draggedTask: Task | null;
  sourcePosition: number | null;
  targetPosition: number | null;
  status: string;
  error: string | null;
}) => {
  console.log("Emitting debug event:", debugInfo);
  const event = new CustomEvent('dragDebugUpdate', { detail: debugInfo });
  window.dispatchEvent(event);
};

export const useTaskReorder = (projectId: string) => {
  const [isReordering, setIsReordering] = useState(false);

  const reorderTasks = ({ tasks, activeId, overId }: ReorderParams) => {
    const oldIndex = tasks.findIndex(t => t.id === activeId);
    const newIndex = tasks.findIndex(t => t.id === overId);
    
    // Emit debug event for drag start
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
    console.log(`Reordering task from position ${oldIndex + 1} to ${newIndex + 1}`);
    console.log("Task being moved:", draggedTask);

    const reorderedTasks = [...tasks];
    const [movedTask] = reorderedTasks.splice(oldIndex, 1);
    reorderedTasks.splice(newIndex, 0, movedTask);

    // Update debug info during reordering
    emitDebugEvent({
      draggedTask: movedTask,
      sourcePosition: oldIndex + 1,
      targetPosition: newIndex + 1,
      status: 'reordering',
      error: null
    });

    // Update order_position for all tasks
    return reorderedTasks.map((task, index) => ({
      ...task,
      order_position: index + 1
    }));
  };

  const updateTasksOrder = async (reorderedTasks: Task[]) => {
    try {
      setIsReordering(true);
      
      // Start update process
      emitDebugEvent({
        draggedTask: null,
        sourcePosition: null,
        targetPosition: null,
        status: 'updating',
        error: null
      });

      if (!reorderedTasks || reorderedTasks.length === 0) {
        throw new Error('No tasks to update');
      }

      console.log("Preparing updates for", reorderedTasks.length, "tasks");
      
      // Prepare updates for backend
      const updates = reorderedTasks.map((task, index) => ({
        id: task.id,
        order_position: index + 1,
        project_id: projectId,
        updated_at: new Date().toISOString()
      }));

      // Execute the actual update against Supabase
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

      return updates;
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
