
import { useState } from "react";
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Task } from "../types/task";
import { SortableTaskItem } from "./SortableTaskItem";
import { TaskItem } from "./TaskItem";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TasksStageGroupProps {
  stage: {
    id: string;
    name: string;
  };
  tasks: Task[];
  activeTab: string;
  getStatusBadge: (status: string) => JSX.Element;
  getPriorityBadge: (priority: string | null) => JSX.Element | null;
  formatDate: (date: string | null) => string;
  onStatusChange: (taskId: string, newStatus: string) => void;
  projectId: string;
  tasksByStage: Record<string, Task[]>;
  setTasksByStage: React.Dispatch<React.SetStateAction<Record<string, Task[]>>>;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
}

export const TasksStageGroup = ({
  stage,
  tasks,
  activeTab,
  getStatusBadge,
  getPriorityBadge,
  formatDate,
  onStatusChange,
  projectId,
  tasksByStage,
  setTasksByStage,
  onEdit,
  onDelete
}: TasksStageGroupProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const stageTasks = tasksByStage[stage.id] || [];
  
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      setIsDragging(false);
      return;
    }
    
    // Find the indices of the dragged and target items
    const oldIndex = stageTasks.findIndex(task => task.id === active.id);
    const newIndex = stageTasks.findIndex(task => task.id === over.id);
    
    if (oldIndex === -1 || newIndex === -1) return;
    
    try {
      // Update local state first for immediate UI response
      const updatedTasks = arrayMove(stageTasks, oldIndex, newIndex);
      
      // Update the tasksByStage state with the new order
      setTasksByStage(prevTasksByStage => ({
        ...prevTasksByStage,
        [stage.id]: updatedTasks
      }));
      
      // Update the database with the new order
      const updatePromises = updatedTasks.map((task, index) => {
        return supabase
          .from('tasks')
          .update({ order_position: index })
          .eq('id', task.id);
      });
      
      await Promise.all(updatePromises);
      
    } catch (error) {
      console.error("Error updating task positions:", error);
      toast.error("حدث خطأ أثناء تحديث ترتيب المهام");
    } finally {
      setIsDragging(false);
    }
  };

  if (stageTasks.length === 0) {
    return (
      <div className="mb-6">
        <div className="text-lg font-semibold mb-2">{stage.name}</div>
        <div className="p-4 border rounded-md bg-gray-50 text-center text-gray-500">
          لا توجد مهام في هذه المرحلة
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="text-lg font-semibold mb-2">{stage.name}</div>
      
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        onDragStart={() => setIsDragging(true)}
      >
        <SortableContext 
          items={stageTasks.map(task => task.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {stageTasks.map(task => (
              <SortableTaskItem 
                key={task.id} 
                id={task.id}
                task={task}
                getStatusBadge={getStatusBadge}
                getPriorityBadge={getPriorityBadge}
                formatDate={formatDate}
                onStatusChange={onStatusChange}
                projectId={projectId}
                isDragging={isDragging}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};
