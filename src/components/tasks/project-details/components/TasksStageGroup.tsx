import React, { useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
} from "@/components/ui/table";
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

// الواجهة المعدّلة مع إضافة props الحالة الشاملة
interface TasksStageGroupProps {
  stage: { id: string; name: string };
  tasks: Task[]; // المهام الخاصة بهذه المرحلة فقط
  activeTab: string;
  getStatusBadge: (status: string) => JSX.Element;
  getPriorityBadge: (priority: string | null) => JSX.Element | null;
  formatDate: (date: string | null) => string;
  onStatusChange: (taskId: string, newStatus: string) => void;
  projectId: string;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  // Props الجديدة لحالة المهام عبر جميع المراحل
  tasksByStage: Record<string, Task[]>;
  setTasksByStage: React.Dispatch<React.SetStateAction<Record<string, Task[]>>>;
}

// تحديد Props لـ TaskItem (مع تضمين الـ props الجديدة التي سيتم تمريرها)
// تم تعديل هذه الواجهة لتشمل الـ props الجديدة
interface TaskItemProps
  extends Omit<
    TasksStageGroupProps,
    "tasks" | "stage" | "activeTab" | "tasksByStage" | "setTasksByStage"
  > {
  task: Task;
  // إضافة الـ props الجديدة إلى TaskItemProps
  tasksByStage: Record<string, Task[]>;
  setTasksByStage: React.Dispatch<React.SetStateAction<Record<string, Task[]>>>;
}

// إنشاء مكون TaskItem قابل للفرز
// تم تعديل هذه الواجهة لتشمل الـ props الجديدة التي تمرر إلى TaskItem
const SortableTaskItem = ({ task, ...props }: TaskItemProps & { id: string }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    // تمرير جميع الـ props بما في ذلك الجديدة إلى TaskItem
    <TableRow ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskItem task={task} {...props} />
    </TableRow>
  );
};

export const TasksStageGroup = ({
  stage,
  tasks, // المهام الخاصة بهذه المرحلة فقط
  activeTab,
  getStatusBadge,
  getPriorityBadge,
  formatDate,
  onStatusChange,
  projectId,
  onEdit,
  onDelete,
  tasksByStage, // الـ prop الجديدة لحالة المهام الشاملة
  setTasksByStage, // الـ prop الجديدة لوظيفة تحديث الحالة الشاملة
}: TasksStageGroupProps) => {
  // لم نعد بحاجة إلى حالة محلية للمهام
  // const [localTasks, setTasks] = useState<Task[]>(tasks);
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

  // لم نعد بحاجة إلى useEffect لتحديث الحالة المحلية
  // useEffect(() => {
  //   // عند تغيير قائمة المهام الواردة (مثلاً عند التحديث من الخارج)، نحدث الحالة المحلية
  //   setTasks(tasks);
  // }, [tasks]);

  // تصفية المهام بناءً على التبويب النشط (نستخدم الـ `tasks` prop مباشرة)
  const filteredTasks = tasks.filter(
    (task) => activeTab === "all" || task.status === activeTab
  );

  // لا نعرض المجموعة إذا لم تكن هناك مهام مفلترة
  if (filteredTasks.length === 0) return null;

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    // إذا لم يتم إسقاط العنصر فوق عنصر آخر، أو إذا كان العنصر فوق نفسه، لا تفعل شيئًا
    if (!over || active?.id === over?.id) return;

    // البحث عن المهمة التي تم سحبها في قائمة المهام لهذه المرحلة (`tasks` prop)
    const activeTask = tasks.find((task) => task.id === active.id);
    if (!activeTask) {
      console.error(`Task with id ${active.id} not found in current stage tasks.`);
      return;
    }

    // البحث عن العنصر الذي تم الإسقاط فوقه في قائمة المهام لهذه المرحلة (`tasks` prop)
    const overTask = tasks.find((task) => over.id === task.id);
    if (!overTask) {
        // هذا السيناريو قد يحدث إذا تم سحب عنصر إلى خارج المجموعة أو فوق عنصر
        // ليس مهمة (مثل رأس الجدول)، ولكن في هذا الكود نحن نسمح بالسحب فقط
        // داخل SortableContext الذي يحتوي على TaskItems.
        // قد تحتاج إلى تعديل هنا إذا كنت تخطط للسحب بين المجموعات.
        console.error(`Task with id ${over.id} not found in current stage tasks.`);
        return;
    }


    // حساب الفهرس القديم والجديد *داخل قائمة المهام لهذه المرحلة*
    const oldIndex = tasks.findIndex((task) => task.id === active.id);
    const newIndex = tasks.findIndex((task) => task.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      console.error("Could not find task during drag end index calculation.");
      return;
    }

    // إذا لم يتغير الفهرس، لا نفعل شيئًا
    if (oldIndex === newIndex) {
        return;
    }

    // إنشاء نسخة جديدة من المهام لجميع المراحل
    const newTasksByStage = { ...tasksByStage };
    const currentStageTasks = [...newTasksByStage[stage.id]]; // نسخة من مهام المرحلة الحالية

    // إعادة ترتيب المهام داخل قائمة المهام لهذه المرحلة
    const [movedTask] = currentStageTasks.splice(oldIndex, 1);
    currentStageTasks.splice(newIndex, 0, movedTask);

    // تحديث المهام لهذه المرحلة في النسخة الجديدة للحالة الشاملة
    newTasksByStage[stage.id] = currentStageTasks;

    // تحديث الحالة الشاملة باستخدام وظيفة التحديث القادمة من الأب
    setTasksByStage(newTasksByStage);


    // **ملاحظة:** منطق تحديث Supabase RPC `update_task_order` قد يحتاج إلى مراجعة.
    // حالياً، هو يستخدم `new_position_param` بناءً على مؤشر في القائمة المفلترة.
    // قد يكون من الأنسب أن يعتمد الـ RPC على المعرفات ويقوم بإعادة ترتيب
    // المهام في قاعدة البيانات بناءً على الترتيب الجديد للمعّرفات المرسلة، أو
    // أن يتم حساب `newPosition` بشكل يتماشى مع ما يتوقعه الـ RPC (ربما الترتيب
    // المطلق ضمن جميع المهام، أو الترتيب ضمن مهام هذه المرحلة).
    // للحفاظ على الكود قريباً من طلبك الأصلي، سنبقي استدعاء الـ RPC كما هو،
    // ولكن ضع في اعتبارك أنك قد تحتاج إلى تعديل منطق الترتيب في الـ RPC
    // ليتوافق مع كيفية إدارة الترتيب في الواجهة الأمامية.

    // حساب الموضع الجديد بناءً على مؤشر العنصر الذي تم الإسقاط فوقه في القائمة المفلترة
    // **تحذير:** حساب newPosition بناءً على filteredTasks قد لا يعكس الترتيب الصحيح
    // في قاعدة البيانات إذا كانت القائمة غير المفلترة هي التي تحدد الترتيب العالمي.
    // تحتاج للتأكد من أن الـ RPC `update_task_order` يتوافق مع هذا الحساب أو قم بتعديله.
     const activeFilteredIndex = filteredTasks.findIndex(task => task.id === active.id);
     const overFilteredIndex = filteredTasks.findIndex(task => task.id === over.id);
     const newPosition = overFilteredIndex; // هذا يعتمد على الفهرس في القائمة المفلترة

    try {
      // استدعاء وظيفة Supabase لتحديث ترتيب المهمة في قاعدة البيانات
      // يرجى التأكد من أن `update_task_order` يتعامل بشكل صحيح مع
      // `task_id_param` و `new_position_param` في سياق الترتيب الذي تريده.
      const { error } = await supabase.rpc("update_task_order", {
        task_id_param: active.id,
        new_position_param: newPosition, // قد تحتاج لتعديل هذا الحساب
      });

      if (error) {
        appToast({
          title: "خطأ في تحديث الترتيب",
          description: "حدث خطأ أثناء حفظ ترتيب المهام",
          variant: "destructive",
        });
        console.error("Error updating task order:", error);
        // في حالة الفشل، نحاول استعادة الحالة السابقة
         // قد تحتاج لاستراتيجية استعادة أكثر تطوراً إذا كانت الحالة معقدة
         // الآن، ببساطة نعتمد على أن الـ `tasks` prop القادمة من الأب سيتم
         // تحديثها ببيانات صحيحة من قاعدة البيانات بعد وقت قصير (إذا كان الأب
         // يستمع لتغييرات قاعدة البيانات)، أو يمكنك إعادة تعيين الحالة هنا
         // يدوياً إلى القائمة الأصلية قبل السحب.
      } else {
         appToast({
           title: "تم تحديث الترتيب",
           description: "تم تحديث ترتيب المهام بنجاح",
         });
      }
    } catch (error) {
      appToast({
        title: "خطأ غير متوقع",
        description: "حدث خطأ غير متوقع أثناء تحديث ترتيب المهام",
        variant: "destructive",
      });
      console.error("Error in handleDragEnd:", error);
       // في حالة الفشل، نحاول استعادة الحالة السابقة
    }
  };

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="bg-gray-50 p-3 border-b">
        <h3 className="font-medium">{stage.name}</h3>
      </div>

      {/* DndContext الصحيح الذي يحيط بالعناصر القابلة للسحب والإفلات */}
      <DndContext onDragEnd={handleDragEnd} sensors={sensors}>
        {/* SortableContext يستخدم معرفات المهام المفلترة للفرز داخل هذه المجموعة */}
        <SortableContext
          items={filteredTasks.map((task) => task.id)}
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
              {/* نستخدم filteredTasks لعرض المهام في الجدول */}
              {filteredTasks.map((task) => (
                <SortableTaskItem
                  key={task.id}
                  id={task.id} // معرف العنصر لـ dnd-kit
                  task={task}
                  getStatusBadge={getStatusBadge}
                  getPriorityBadge={getPriorityBadge}
                  formatDate={formatDate}
                  onStatusChange={onStatusChange}
                  projectId={projectId}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  tasksByStage={tasksByStage} // تمرير الـ prop الجديدة
                  setTasksByStage={setTasksByStage} // تمرير الـ prop الجديدة
                />
              ))}
            </TableBody>
          </Table>
        </SortableContext>
      </DndContext>
    </div>
  );
};