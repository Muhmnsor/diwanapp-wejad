// src/components/tasks/project-details/components/TasksContent.tsx

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
  // إضافة متغير لتتبع المهام مرتبة حسب المراحل
  const [localTasksByStage, setLocalTasksByStage] = useState<Record<string, Task[]>>({});

  // تحديث useEffect لتهيئة المهام المحلية
  useEffect(() => {
    setLocalTasks(filteredTasks);

    // تحديث المهام حسب المراحل
    const tasksByStageMap = {} as Record<string, Task[]>;
    projectStages.forEach(stage => {
      tasksByStageMap[stage.id] = tasksByStage[stage.id] || [];
    });
    setLocalTasksByStage(tasksByStageMap);
  }, [filteredTasks, projectStages, tasksByStage]);

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

  // نحتاج إلى معرفة المرحلة التي تنتمي إليها المهمة المسحوبة والمرحلة المستهدفة
  // هنا سنفترض أننا نستطيع الحصول عليها من البيانات المخزنة في active و over
  // قد تحتاج لتعديل هذا المنطق حسب كيفية تخزين البيانات في مشروعك

  const activeTask = localTasks.find(t => t.id === active.id.toString());
  const overTask = localTasks.find(t => t.id === over.id.toString());

  if (!activeTask || !overTask) return;

  const activeStageId = activeTask.stage_id;
  const overStageId = overTask.stage_id;

  const reorderedTasks = reorderTasks({
    tasks: localTasks,
    activeId: active.id.toString(),
    overId: over.id.toString(),
    activeStageId,
    overStageId
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

    // 3. إعادة تنظيم المهام حسب المراحل
    const updatedTasksByStage = {} as Record<string, Task[]>;
    projectStages.forEach(stage => {
      updatedTasksByStage[stage.id] = reorderedTasks
        .filter(task => task.stage_id === stage.id)
        .sort((a, b) => (a.order_position || 0) - (b.order_position || 0));
    });
    setLocalTasksByStage(updatedTasksByStage);

    // 4. إضافة تأخير قبل إعادة جلب البيانات
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
        {/* استخدام SortableContext واحد لجميع المهام بدلاً من SortableContext لكل مرحلة */}
        <SortableContext
          items={localTasks.map(task => task.id)}
          strategy={verticalListSortingStrategy}
        >
          {activeTab === "all" && projectStages.length > 0 && !isGeneral ? (
            <div className="space-y-6" dir="rtl">
              {projectStages.map(stage => (
                <div key={stage.id} className="border rounded-md overflow-hidden">
                  <div className="bg-gray-50 p-3 border-b">
                    <h3 className="font-medium">{stage.name}</h3>
                  </div>
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
                      {/* استخدام localTasks المرشحة حسب stage_id بدلاً من tasksByStage */}
                      {localTasks
  .filter(task => task.stage_id === stage.id)
  .sort((a, b) => (a.order_position || 0) - (b.order_position || 0))
  .map(task => (

                        <TaskItem
                          key={task.id}
                          task={task}
                          isDraggable={true}
                          getStatusBadge={getStatusBadge}
                          getPriorityBadge={getPriorityBadge}
                          formatDate={formatDate}
                          onStatusChange={onStatusChange}
                          projectId={projectId || ''}
                          onEdit={onEditTask}
                          onDelete={onDeleteTask}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </div>
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
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </SortableContext>
      </DndContext>
      <DragDebugOverlay />
    </div>
  );
};
