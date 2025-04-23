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
  onDeleteTask
}: TasksContentProps) => {
  const { reorderTasks, isReordering } = useTaskReorder(projectId || '');
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // تحديث handleDragEnd داخل المكون
const handleDragEnd = async (event: DragEndEvent) => {
  const { active, over } = event;

  if (!over || active.id === over.id) return;

  try {
    const success = await reorderTasks({
      tasks: filteredTasks,
      activeId: active.id.toString(),
      overId: over.id.toString()
    });

    if (success) {
      toast.success("تم إعادة ترتيب المهام بنجاح");
      // إذا كان لديك دالة لتحديث قائمة المهام، قم باستدعائها هنا
      // مثال: await refetchTasks();
    } else {
      toast.error("حدث خطأ أثناء إعادة ترتيب المهام");
    }
  } catch (error) {
    console.error('خطأ في handleDragEnd:', error);
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

  // تعديل الشرط في بداية الـ render
  const shouldEnableDragAndDrop = !isGeneral && activeTab === "all" && projectStages.length > 0;

  // تغليف المحتوى بـ DndContext فقط إذا كان السحب والإسقاط مفعل
  return shouldEnableDragAndDrop ? (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
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
            projectId={projectId}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
            isDraggable={true}
          />
        ))}
      </div>
    </DndContext>
  ) : (
    // محتوى عادي بدون سحب وإسقاط
    <div className="space-y-6" dir="rtl">
      {activeTab === "all" && projectStages.length > 0 ? (
        // عرض المهام حسب المراحل
        projectStages.map(stage => (
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
            isDraggable={false}
          />
        ))
      ) : (
        // عرض جدول المهام
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
              {filteredTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  isDraggable={false}
                  getStatusBadge={getStatusBadge}
                  getPriorityBadge={getPriorityBadge}
                  formatDate={formatDate}
                  onStatusChange={onStatusChange}
                  projectId={projectId}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};
