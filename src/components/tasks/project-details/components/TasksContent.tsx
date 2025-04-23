import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Task } from "../types/task";
import { TasksStageGroup } from "./TasksStageGroup";
import { TaskCard } from "./TaskCard";
import { Table, TableHeader, TableRow, TableHead, TableBody } from "@/components/ui/table";
import { TaskItem } from "./TaskItem";
import { useTaskReorder } from "../hooks/useTaskReorder";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { DragDebugOverlay } from './debug/DragDebugOverlay';

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
  const { reorderTasks, updateTasksOrder, isReordering } = useTaskReorder(projectId || '');
  const [localTasks, setLocalTasks] = useState<Task[]>([]);
  
  useEffect(() => {
    setLocalTasks(filteredTasks);
  }, [filteredTasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

const handleDragEnd = async (event: DragEndEvent) => {
  const { active, over } = event;
    
  if (!over || active.id === over.id) return;

  const reorderedTasks = reorderTasks({
    tasks: localTasks,
    activeId: active.id.toString(),
    overId: over.id.toString()
  });

  if (!reorderedTasks) {
    toast.error("حدث خطأ في إعادة الترتيب");
    return;
  }

  try {
    // 1. تحديث قاعدة البيانات أولاً
    const updates = await updateTasksOrder(reorderedTasks);
    
    if (!updates) {
      toast.error("حدث خطأ في تحديث الترتيب");
      return;
    }

    // 2. تحديث الحالة المحلية فقط بعد نجاح تحديث قاعدة البيانات
    setLocalTasks(reorderedTasks);
    
    // 3. إضافة تأخير قبل إعادة جلب البيانات
    setTimeout(() => {
      refetchTasks();
    }, 500);

    toast.success("تم إعادة ترتيب المهام بنجاح");
  } catch (error) {
    console.error('Error updating task order:', error);
    toast.error("حدث خطأ أثناء حفظ الترتيب الجديد");
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
    <div className="space-y-6">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
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
                    items={localTasks.map(task => task.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {localTasks.map(task => (
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
      <DragDebugOverlay />
    </div>
  );
};
