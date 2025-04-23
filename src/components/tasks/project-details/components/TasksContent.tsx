
import { useEffect, useState } from "react";
import { Task } from "../types/task";
import { TasksTable } from "./TasksTable";
import { TasksStageGroup } from "./TasksStageGroup";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { DndContext, DragEndEvent, DragStartEvent, closestCenter } from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useTaskReorder } from "../hooks/useTaskReorder";
import { DragDebugOverlay } from "./debug/DragDebugOverlay";

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
  const { reorderTasks, updateTasksOrder } = useTaskReorder(projectId);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeStage, setActiveStage] = useState<string | null>(null);
  
  // Sort tasks by order_position first, fallback to created_at
  useEffect(() => {
    const sortedTasks = [...filteredTasks].sort((a, b) => {
      // First by order_position if both have it
      if (a.order_position && b.order_position) {
        return a.order_position - b.order_position;
      }
      // If only one has order_position, that one comes first
      if (a.order_position) return -1;
      if (b.order_position) return 1;
      
      // Fallback: sort by created_at (newest first)
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA;
    });
    
    setTasks(sortedTasks);
  }, [filteredTasks]);

  // Handle drag start to track which stage we're dragging from
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeData = active.data.current as any;
    if (activeData && activeData.stageId) {
      setActiveStage(activeData.stageId);
    } else {
      setActiveStage(null);
    }
  };

  // Handle drag end for reordering
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    if (active.id !== over.id) {
      const activeId = String(active.id);
      const overId = String(over.id);
      
      // Get the stage ID from the drag data
      const stageId = (active.data.current as any)?.stageId;
      
      // If within a stage, reorder tasks within that stage
      if (stageId) {
        const stageTasks = tasksByStage[stageId] || [];
        const reordered = reorderTasks({
          tasks: stageTasks,
          activeId,
          overId,
          stageId
        });
        
        if (reordered) {
          // Update tasks within the stage
          await updateTasksOrder(reordered, stageId);
        }
      } else {
        // For tasks without stages (general tasks)
        const reordered = reorderTasks({
          tasks,
          activeId,
          overId
        });
        
        if (reordered) {
          await updateTasksOrder(reordered);
        }
      }
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-2 text-gray-500">جاري تحميل المهام...</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">لا توجد مهام حالياً</p>
      </div>
    );
  }

  // Determine the rendering mode - show stages or not
  const hasStages = projectStages.length > 0 && !isGeneral;

  return (
    <>
      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
      >
        {hasStages ? (
          <div className="space-y-6">
            {projectStages.map((stage) => (
              <TasksStageGroup
                key={stage.id}
                stage={stage}
                tasks={tasksByStage[stage.id] || []}
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
            {/* Tasks without a stage */}
            {tasks.filter((task) => !task.stage_id).length > 0 && (
              <div className="border rounded-md overflow-hidden mt-4">
                <div className="bg-gray-50 p-3 border-b">
                  <h3 className="font-medium">مهام بدون مرحلة</h3>
                </div>
                <TasksTable
                  tasks={tasks.filter((task) => !task.stage_id)}
                  getStatusBadge={getStatusBadge}
                  getPriorityBadge={getPriorityBadge}
                  formatDate={formatDate}
                  onStatusChange={onStatusChange}
                  projectId={projectId}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                />
              </div>
            )}
          </div>
        ) : (
          <TasksTable
            tasks={tasks}
            getStatusBadge={getStatusBadge}
            getPriorityBadge={getPriorityBadge}
            formatDate={formatDate}
            onStatusChange={onStatusChange}
            projectId={projectId}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
          />
        )}
      </DndContext>
      <DragDebugOverlay />
    </>
  );
};
