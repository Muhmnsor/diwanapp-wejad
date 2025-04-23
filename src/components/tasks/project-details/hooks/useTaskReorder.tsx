
import { useState } from 'react';
import { Task } from "../types/task";

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
  const event = new CustomEvent('dragDebugUpdate', { detail: debugInfo });
  window.dispatchEvent(event);
};

export const useTaskReorder = (projectId: string) => {
  const [isReordering, setIsReordering] = useState(false);

  const reorderTasks = ({ tasks, activeId, overId }: ReorderParams) => {
    const oldIndex = tasks.findIndex(t => t.id === activeId);
    const newIndex = tasks.findIndex(t => t.id === overId);
    
    if (oldIndex === -1 || newIndex === -1) {
      emitDebugEvent({
        draggedTask: tasks.find(t => t.id === activeId) || null,
        sourcePosition: oldIndex === -1 ? null : oldIndex + 1,
        targetPosition: newIndex === -1 ? null : newIndex + 1,
        status: 'error',
        error: 'Invalid source or target position'
      });
      return null;
    }

    const reorderedTasks = [...tasks];
    const [movedTask] = reorderedTasks.splice(oldIndex, 1);
    reorderedTasks.splice(newIndex, 0, movedTask);

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
      emitDebugEvent({
        draggedTask: null,
        sourcePosition: null,
        targetPosition: null,
        status: 'updating',
        error: null
      });

      // Here just prepare the updates for backend
      const updates = reorderedTasks.map((task, index) => ({
        id: task.id,
        order_position: index + 1,
        project_id: projectId,
        updated_at: new Date().toISOString()
      }));

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
      emitDebugEvent({
        draggedTask: null,
        sourcePosition: null,
        targetPosition: null,
        status: 'error',
        error: errorMessage
      });
      console.error('Error preparing task order:', error);
      return null;
    } finally {
      setIsReordering(false);
    }
  };

  return {
    reorderTasks,
    updateTasksOrder,
    isReordering
  };
};
