import { useState } from 'react';
import { Task } from "../types/task";

interface ReorderParams {
  tasks: Task[];
  activeId: string;
  overId: string;
}

export const useTaskReorder = (projectId: string) => {
  const [isReordering, setIsReordering] = useState(false);

  const reorderTasks = ({ tasks, activeId, overId }: ReorderParams) => {
    const oldIndex = tasks.findIndex(t => t.id === activeId);
    const newIndex = tasks.findIndex(t => t.id === overId);
    
    if (oldIndex === -1 || newIndex === -1) return null;

    const reorderedTasks = [...tasks];
    const [movedTask] = reorderedTasks.splice(oldIndex, 1);
    reorderedTasks.splice(newIndex, 0, movedTask);

    // Update order_position for all tasks
    return reorderedTasks.map((task, index) => ({
      ...task,
      order_position: index + 1
    }));
  };

  const updateTasksOrder = async (reorderedTasks: Task[]) => {
    try {
      setIsReordering(true);
      // Here just prepare the updates for backend
      const updates = reorderedTasks.map((task, index) => ({
        id: task.id,
        order_position: index + 1,
        project_id: projectId,
        updated_at: new Date().toISOString()
      }));

      // Return the updates to be handled by parent
      return updates;
    } catch (error) {
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
