
import { useEffect, useState } from "react";
import { TasksTable } from "./TasksTable";
import { TasksStageGroup } from "./TasksStageGroup";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { Task } from "../types/task";
import { Skeleton } from "@/components/ui/skeleton";

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
  projectId = "",
  isGeneral = false,
  onEditTask,
  onDeleteTask
}: TasksContentProps) => {
  const [localTasks, setLocalTasks] = useState<Task[]>(filteredTasks);
  const [localTasksByStage, setLocalTasksByStage] = useState(tasksByStage);

  useEffect(() => {
    setLocalTasks(filteredTasks);
    setLocalTasksByStage(tasksByStage);
  }, [filteredTasks, tasksByStage]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      return;
    }

    // Get the dragged task and its data
    const draggedItemId = active.id as string;
    const draggedTask = filteredTasks.find(task => task.id === draggedItemId);
    
    if (!draggedTask) return;

    if (isGeneral || !projectStages || projectStages.length === 0) {
      setLocalTasks(tasks => {
        const oldIndex = tasks.findIndex(t => t.id === active.id);
        const newIndex = tasks.findIndex(t => t.id === over.id);
        return arrayMove(tasks, oldIndex, newIndex);
      });
    } else {
      // Handle stage-based drag and drop
      setLocalTasksByStage(prev => {
        const newTasksByStage = { ...prev };
        
        // Find which stage lists are affected
        let sourceStageId = "";
        let targetStageId = "";
        
        for (const [stageId, tasks] of Object.entries(prev)) {
          if (tasks.some(t => t.id === active.id)) {
            sourceStageId = stageId;
          }
          if (tasks.some(t => t.id === over.id)) {
            targetStageId = stageId;
          }
        }
        
        if (!sourceStageId || !targetStageId) return prev;
        
        // Remove from source
        const sourceTasks = [...(prev[sourceStageId] || [])];
        const targetTasks = [...(prev[targetStageId] || [])];
        
        const oldIndex = sourceTasks.findIndex(t => t.id === active.id);
        const newIndex = targetTasks.findIndex(t => t.id === over.id);
        
        // If same stage, just reorder
        if (sourceStageId === targetStageId) {
          newTasksByStage[sourceStageId] = arrayMove(sourceTasks, oldIndex, newIndex);
        } else {
          // Move between stages
          const [movedTask] = sourceTasks.splice(oldIndex, 1);
          if (movedTask) {
            movedTask.stage_id = targetStageId;
            targetTasks.splice(newIndex, 0, movedTask);
            newTasksByStage[sourceStageId] = sourceTasks;
            newTasksByStage[targetStageId] = targetTasks;
          }
        }
        
        return newTasksByStage;
      });
    }
  };

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      {isGeneral || !projectStages || projectStages.length === 0 ? (
        <TasksTable
          tasks={localTasks}
          activeTab={activeTab}
          getStatusBadge={getStatusBadge}
          getPriorityBadge={getPriorityBadge}
          formatDate={formatDate}
          onStatusChange={onStatusChange}
          projectId={projectId}
          onEdit={onEditTask}
          onDelete={onDeleteTask}
        />
      ) : (
        <div className="space-y-6">
          {projectStages.map(stage => (
            <TasksStageGroup
              key={stage.id}
              stage={stage}
              tasks={localTasksByStage[stage.id] || []}
              activeTab={activeTab}
              getStatusBadge={getStatusBadge}
              getPriorityBadge={getPriorityBadge}
              formatDate={formatDate}
              onStatusChange={onStatusChange}
              projectId={projectId}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))}
        </div>
      )}
    </DndContext>
  );
};
