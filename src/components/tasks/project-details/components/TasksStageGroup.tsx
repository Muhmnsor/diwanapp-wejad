import React, { useState, useEffect } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody } from "@/components/ui/table";
import { TaskItem } from "./TaskItem";
import {
  DndContext,
  DragEndEvent,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Task } from "../types/task";
import { useToast as useAppToast } from "@/hooks/use-toast"; // تجنب تعارض الأسماء

interface TasksStageGroupProps {
  stage: { id: string; name: string };
  tasks: Task[];
  activeTab: string;
  getStatusBadge: (status: string) => JSX.Element;
  getPriorityBadge: (priority: string | null) => JSX.Element | null;
  formatDate: (date: string | null) => string;
  onStatusChange: (taskId: string, newStatus: string) => void;
  projectId: string;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
}

// إنشاء مكون TaskItem قابل للفرز
const SortableTaskItem = ({ task, ...props }: TaskItemProps & { id: string }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableRow ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskItem task={task} {...props} />
    </TableRow>
  );
};

interface TaskItemProps extends Omit<TasksStageGroupProps, 'tasks' | 'stage' | 'activeTab'> {
  task: Task;
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
  onEdit,
  onDelete,
}: TasksStageGroupProps) => {
  const [localTasks, setTasks] = useState<Task[]>(tasks);
  const { toast: appToast } = useAppToast(); // استخدام اسم مختلف لتجنب التعارض

  // أضفنا دعم لوحة المفاتيح هنا مع الحفاظ على إعدادات مؤشر الماوس
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // تتطلب تحريك 5 بكسل قبل تفعيل السحب بالمؤشر
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    // عند تغيير قائمة المهام الواردة (مثلاً عند التحديث من الخارج)، نحدث الحالة المحلية
    setTasks(tasks);
  }, [tasks]);

  // تصفية المهام بناءً على التبويب النشط
  const filteredTasks = localTasks.filter(
    (task) => activeTab === "all" || task.status === activeTab
  );

  // لا نعرض المجموعة إذا لم تكن هناك مهام مفلترة
  if (filteredTasks.length === 0) return null;

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    // إذا لم يتم إسقاط العنصر فوق عنصر آخر، أو إذا كان العنصر فوق نفسه، لا تفعل شيئًا
    if (!over || active?.id === over?.id) return;

    const oldIndex = localTasks.findIndex(task => task.id === active.id);
    const newIndex = localTasks.findIndex(task => task.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return; // أحد العناصر غير موجود في القائمة المحلية
    }

    // إنشاء نسخة من المهام المحلية وتحديث ترتيبها
    const newTasks = [...localTasks];
    const [movedTask] = newTasks.splice(oldIndex, 1);
    newTasks.splice(newIndex, 0, movedTask);
    setTasks(newTasks);

    // العثور على مؤشر العنصر النشط والعنصر الذي تم الإسقاط فوقه في القائمة المفلترة
    const activeFilteredIndex = filteredTasks.findIndex(task => task.id === active.id);
    const overFilteredIndex = filteredTasks.findIndex(task => task.id === over.id);

    // حساب الموضع الجديد بناءً على مؤشر العنصر الذي تم الإسقاط فوقه في القائمة المفلترة
    const newPosition = overFilteredIndex;

    try {
      // استدعاء وظيفة Supabase لتحديث ترتيب المهمة في قاعدة البيانات
      const { error } = await supabase.rpc("update_task_order", {
        task_id_param: active.id,
        new_position_param: newPosition
      });

      if (error) {
        appToast({
          title: "خطأ في تحديث الترتيب",
          description: "حدث خطأ أثناء حفظ ترتيب المهام",
          variant: "destructive",
        });
        console.error("Error updating task order:", error);
        // استعادة الترتيب السابق في حالة الفشل
        setTasks(tasks);
        return;
      }

      appToast({
        title: "تم تحديث الترتيب",
        description: "تم تحديث ترتيب المهام بنجاح",
      });
    } catch (error) {
      appToast({
        title: "خطأ غير متوقع",
        description: "حدث خطأ غير متوقع أثناء تحديث ترتيب المهام",
        variant: "destructive",
      });
      console.error("Error in handleDragEnd:", error);
      // استعادة الترتيب السابق في حالة الفشل
      setTasks(tasks);
    }
  };

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="bg-gray-50 p-3 border-b">
        <h3 className="font-medium">{stage.name}</h3>
      </div>

      {/* DndContext الصحيح الذي يحيط بالعناصر القابلة للسحب والإفلات */}
      <DndContext onDragEnd={handleDragEnd} sensors={sensors}>
        <SortableContext
          items={filteredTasks.map((task) => task.id)} // تحديد العناصر التي يمكن فرزها باستخدام معرفاتها
          strategy={verticalListSortingStrategy} // استخدام استراتيجية الفرز العمودي
        >
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
              {filteredTasks.map((task) => (
                <SortableTaskItem
                  key={task.id}
                  id={task.id}
                  task={task}
                  getStatusBadge={getStatusBadge}
                  getPriorityBadge={getPriorityBadge}
                  formatDate={formatDate}
                  onStatusChange={onStatusChange}
                  projectId={projectId}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  tasksByStage={tasksByStage}   
                  setTasksByStage={setTasksByStage}
                />
              ))}
            </TableBody>
          </Table>
        </SortableContext>
      </DndContext>
    </div>
  );
};
