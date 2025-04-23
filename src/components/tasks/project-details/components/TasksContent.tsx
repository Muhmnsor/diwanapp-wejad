import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Task } from "../types/task";
import { TasksStageGroup } from "./TasksStageGroup";
import { TaskCard } from "./TaskCard";
import { Table, TableHeader, TableRow, TableHead, TableBody } from "@/components/ui/table";
import { TaskItem } from "./TaskItem";
import { useTaskReorder } from "../hooks/useTaskReorder";
import { toast } from "sonner";
import { DragDebugPanel } from "./debug/DragDebugPanel";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

interface TasksContentProps {
  isLoading: boolean;
  activeTab: string;
  filteredTasks: Task[];
  projectStages: {
    id: string;
    name: string;
  }[];
  tasksByStage: Record<string, Task[]>;
  getStatusBadge: (status: string) => JSX.Element;
  getPriorityBadge: (priority: string | null) => JSX.Element | null;
  formatDate: (date: string | null) => string;
  onStatusChange: (taskId: string, newStatus: string) => void;
  projectId?: string | undefined;
  isGeneral?: boolean;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
  refetchTasks: () => Promise<void>;
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
  projectId,
  isGeneral = false,
  onEditTask,
  onDeleteTask,
  refetchTasks
}: TasksContentProps) => {
  const { reorderTasks, isReordering } = useTaskReorder(projectId || '');
  
  const [debugInfo, setDebugInfo] = useState({
    activeTaskId: null,
    overTaskId: null,
    isDragging: false,
    currentStageId: null,
    targetStageId: null,
    reorderStatus: 'idle',
    lastError: null
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setDebugInfo(prev => ({
      ...prev,
      activeTaskId: active.id as string,
      isDragging: true,
      currentStageId: active.data?.current?.stage_id || null,
      reorderStatus: 'idle',
      lastError: null
    }));
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    setDebugInfo(prev => ({
      ...prev,
      overTaskId: over?.id as string || null,
      targetStageId: over?.data?.current?.stage_id || null
    }));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      setDebugInfo(prev => ({
        ...prev,
        isDragging: false,
        reorderStatus: 'idle'
      }));
      return;
    }

    try {
      setDebugInfo(prev => ({
        ...prev,
        reorderStatus: 'loading'
      }));

      const result = await reorderTasks({
        tasks: filteredTasks,
        activeId: active.id.toString(),
        overId: over.id.toString()
      });

      setDebugInfo(prev => ({
        ...prev,
        isDragging: false,
        reorderStatus: result.success ? 'success' : 'error',
        lastError: result.success ? null : 'Reorder operation failed'
      }));

      if (result.success) {
        toast.success("تم إعادة ترتيب المهام بنجاح");
        await refetchTasks();
      } else {
        toast.error("حدث خطأ أثناء إعادة ترتيب المهام");
      }
    } catch (error) {
      console.error('خطأ في handleDragEnd:', error);
      setDebugInfo(prev => ({
        ...prev,
        isDragging: false,
        reorderStatus: 'error',
        lastError: error.message
      }));
      toast.error("حدث خطأ أثناء إعادة ترتيب المهام");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3" dir="rtl">
        {[...Array(3)].map((_, index) => <Skeleton key={index} className="h-24 w-full" />)}
      </div>
    );
  }

  if (filteredTasks.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-md border" dir="rtl">
        <p className="text-gray-500">لا توجد مهام {activeTab !== "all" && "بهذه الحالة"}</p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <DragDebugPanel debugInfo={debugInfo} />

      {activeTab === "all" && projectStages.length > 0 && !isGeneral ? (
        <div className="space-y-6" dir="rtl">
          {projectStages.map(stage => (
            <TasksStageGroup
              key={stage.id}
              stage={stage}
              tasks={tasksByStage[stage.id] || []}
              activeTab={activeTab}
              getStatusBadge={getStatusBadge}
              getPriorityBadge={getPriorityBadge}
              formatDate={formatDate}
              onStatusChange={onStatusChange}
              projectId={projectId || ''}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-6" dir="rtl">
          <div className="bg-white rounded-md shadow-sm overflow-hidden border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>المهمة</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الأولوية</TableHead>
                  <TableHead>المكلف</TableHead>
                  <TableHead>تاريخ الاستحقاق</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <SortableContext
                  items={filteredTasks.map(task => task.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {filteredTasks.map(task => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      isDraggable={activeTab === "all" && !isGeneral}
                      getStatusBadge={getStatusBadge}
                      getPriorityBadge={getPriorityBadge}
                      formatDate={formatDate}
                      onStatusChange={onStatusChange}
                      projectId={projectId || ''}
                      onEdit={onEditTask}
                      onDelete={onDeleteTask}
                    />
                  ))}
                </SortableContext>
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </DndContext>
  );
};
