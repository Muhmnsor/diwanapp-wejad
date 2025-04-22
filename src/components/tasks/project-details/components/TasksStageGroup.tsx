import React, { useState, useEffect } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody } from "@/components/ui/table";
import { TaskItem } from "./TaskItem";
// استيراد KeyboardSensor و sortableKeyboardCoordinates
import { DndContext, DragEndEvent, useSensor, useSensors, PointerSensor, KeyboardSensor } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Task } from "../types/task";

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
  onDelete
}: TasksStageGroupProps) => {
  const [localTasks, setTasks] = useState<Task[]>(tasks);

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
    if (!over || active.id === over.id) return;
    
    // العثور على مؤشر العنصر النشط والعنصر الذي تم الإسقاط فوقه في القائمة المفلترة
    const activeIndex = filteredTasks.findIndex(task => task.id === active.id);
    const overIndex = filteredTasks.findIndex(task => task.id === over.id);
    
    // حساب الموضع الجديد بناءً على مؤشر العنصر الذي تم الإسقاط فوقه في القائمة المفلترة
    const newPosition = overIndex;
    
    try {
      // استدعاء وظيفة Supabase لتحديث ترتيب المهمة في قاعدة البيانات
      const { error } = await supabase.rpc("update_task_order", {
        task_id_param: active.id,
        new_position_param: newPosition
      });

      if (error) {
        toast.error("حدث خطأ أثناء تحديث الترتيب");
        console.error("Error updating task order:", error);
        return;
      }

      // تحديث الحالة المحلية لتعكس الترتيب الجديد للمهام
      const newTasks = [...localTasks];
      const [movedTask] = newTasks.splice(activeIndex, 1); // إزالة المهمة من موضعها القديم
      newTasks.splice(overIndex, 0, movedTask); // إدخال المهمة في موضعها الجديد
      setTasks(newTasks);
      
      toast.success("تم تحديث ترتيب المهام بنجاح");
    } catch (error) {
      toast.error("حدث خطأ أثناء تحديث الترتيب");
      console.error("Error in handleDragEnd:", error);
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
              {/* عرض المهام المفلترة والقابلة للفرز */}
              {filteredTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  getStatusBadge={getStatusBadge}
                  getPriorityBadge={getPriorityBadge}
                  formatDate={formatDate}
                  onStatusChange={onStatusChange}
                  projectId={projectId}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </TableBody>
          </Table>
        </SortableContext>
      </DndContext>
    </div>
  );
};