
import React from 'react';
import { Task } from '../types/task';
import { TasksStageGroup } from './TasksStageGroup';
import { Skeleton } from "@/components/ui/skeleton";
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent
} from '@dnd-kit/core';
import { useTaskReorder } from '../hooks/useTaskReorder';

interface TasksContentProps {
  isLoading: boolean;
  activeTab: string;
  filteredTasks: Task[];
  projectStages: { id: string; name: string }[];
  tasksByStage: Record<string, Task[]>;
  getStatusBadge: (status: string) => JSX.Element;
  getPriorityBadge: (priority: string | null) => JSX.Element | null;
  formatDate: (date: string | null) => string;
  onStatusChange: (taskId: string, newStatus: string) => void;
  projectId?: string;
  isGeneral?: boolean;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
  onDragDebugUpdate?: (debugData: any) => void;
}

export const TasksContent = ({
  isLoading,
  activeTab,
  filteredTasks,
  projectStages,
  tasksByStage,
  getStatusBadge,
  getPriorityBadge,
  formatDate,
  onStatusChange,
  projectId = '',
  isGeneral = false,
  onEditTask,
  onDeleteTask,
  onDragDebugUpdate
}: TasksContentProps) => {
  const { reorderTasks, isReordering, optimisticTasks } = useTaskReorder(projectId);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    console.log("Drag started with task:", active.id);
    
    // Find the task's current stage
    let currentStageId = null;
    for (const [stageId, stageTasks] of Object.entries(tasksByStage)) {
      if (stageTasks.some(task => task.id === active.id)) {
        currentStageId = stageId;
        break;
      }
    }
    
    // Update debug info
    if (onDragDebugUpdate) {
      onDragDebugUpdate({
        activeTaskId: active.id,
        isDragging: true,
        currentStageId,
        reorderStatus: 'idle',
        lastError: null
      });
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Update debug info with over task info
    if (onDragDebugUpdate && event.over) {
      onDragDebugUpdate({
        overTaskId: event.over.id,
        targetStageId: event.over.data?.current?.stageId
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      console.log("Drag ended with:", { activeId: active.id, overId: over.id });
      
      // Find tasks
      let tasksToReorder = [] as Task[];
      let stageId = '';
      
      // Get the correct array of tasks to reorder
      for (const [currentStageId, stageTasks] of Object.entries(tasksByStage)) {
        if (stageTasks.some(task => task.id === active.id)) {
          tasksToReorder = stageTasks;
          stageId = currentStageId;
          break;
        }
      }
      
      if (tasksToReorder.length > 0) {
        try {
          // Update debug info to show reordering in progress
          if (onDragDebugUpdate) {
            onDragDebugUpdate({
              reorderStatus: 'loading',
            });
          }
          
          // Call the reorder function
          const result = await reorderTasks({
            tasks: tasksToReorder,
            activeId: active.id as string,
            overId: over.id as string,
          });
          
          // Update debug info based on result
          if (onDragDebugUpdate) {
            onDragDebugUpdate({
              reorderStatus: result.success ? 'success' : 'error',
              lastError: result.success ? null : 'Failed to reorder tasks',
              isDragging: false,
              activeTaskId: null,
              overTaskId: null
            });
          }
        } catch (error) {
          console.error('Error in drag end handler:', error);
          
          // Update debug info with error
          if (onDragDebugUpdate) {
            onDragDebugUpdate({
              reorderStatus: 'error',
              lastError: error.message || 'Unknown error occurred',
              isDragging: false,
              activeTaskId: null,
              overTaskId: null
            });
          }
        }
      } else {
        console.warn('Could not find tasks to reorder');
        if (onDragDebugUpdate) {
          onDragDebugUpdate({
            reorderStatus: 'error',
            lastError: 'Could not find tasks to reorder',
            isDragging: false,
            activeTaskId: null,
            overTaskId: null
          });
        }
      }
    } else {
      // Reset debug info if no valid drop
      if (onDragDebugUpdate) {
        onDragDebugUpdate({
          isDragging: false,
          activeTaskId: null,
          overTaskId: null,
          reorderStatus: 'idle'
        });
      }
    }
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (!projectStages || projectStages.length === 0) {
    // Handle general tasks (not grouped by stage)
    return (
      <div className="space-y-6">
        <TasksStageGroup
          stage={{ id: "default", name: "المهام" }}
          tasks={filteredTasks}
          activeTab={activeTab}
          getStatusBadge={getStatusBadge}
          getPriorityBadge={getPriorityBadge}
          formatDate={formatDate}
          onStatusChange={onStatusChange}
          projectId={projectId}
          onEdit={onEditTask}
          onDelete={onDeleteTask}
        />
      </div>
    );
  }

  // Tasks grouped by stages
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-6">
        {projectStages.map((stage) => {
          const stageTasks = tasksByStage[stage.id] || [];
          // Apply optimistic updates if available
          const tasksToShow = optimisticTasks.length > 0 && stageTasks.some(task => 
            optimisticTasks.some(ot => ot.id === task.id)
          ) ? optimisticTasks.filter(task => task.stage_id === stage.id) : stageTasks;
          
          return (
            <TasksStageGroup
              key={stage.id}
              stage={stage}
              tasks={tasksToShow}
              activeTab={activeTab}
              getStatusBadge={getStatusBadge}
              getPriorityBadge={getPriorityBadge}
              formatDate={formatDate}
              onStatusChange={onStatusChange}
              projectId={projectId}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          );
        })}
      </div>
    </DndContext>
  );
};
