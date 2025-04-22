import { Calendar, Users, Check, Clock, AlertCircle, ChevronDown, ChevronUp, MessageCircle, Download, Trash2, Edit, Link2, GripVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TableRow, TableCell } from "@/components/ui/table";
import { Task } from "../types/task";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { SubtasksList } from "./subtasks/SubtasksList";
import { checkPendingSubtasks } from "../services/subtasksService";
// لا نستورد مكونات الحوار هنا، سيتم التعامل معها في المكون الأب
// import { TaskDiscussionDialog } from "../../components/TaskDiscussionDialog";
// import { TaskDependenciesDialog } from "./dependencies/TaskDependenciesDialog";
import { useTaskDependencies } from "../hooks/useTaskDependencies";
import { usePermissionCheck } from "../hooks/usePermissionCheck";
import { useTaskButtonStates } from "../../hooks/useTaskButtonStates";
import { DependencyIcon } from "../../components/dependencies/DependencyIcon";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
// لا نستورد مكونات الحوار هنا
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";

interface TaskItemProps {
  task: Task;
  getStatusBadge: (status: string) => JSX.Element;
  getPriorityBadge: (priority: string | null) => JSX.Element | null;
  formatDate: (date: string | null) => string;
  onStatusChange: (taskId: string, newStatus: string) => void;
  projectId: string;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void; // هذا قد يبقى للدلالة على القدرة على الحذف، لكن التأكيد سيتم عبر onConfirmDelete
  isDraggable?: boolean;
  // دوال رد النداء التي سيستمع إليها المكون الأب لفتح الحوارات
  onShowDiscussion: (task: Task) => void;
  onShowDependencies: (task: Task) => void;
  onConfirmDelete: (taskId: string) => void; // استدعاء هذا سيفتح حوار التأكيد في الأب
}

interface TaskAttachment {
  id: string;
  file_name: string;
  file_url: string;
  created_at: string;
  created_by: string;
}

export const TaskItem = ({
  task,
  getStatusBadge,
  getPriorityBadge,
  formatDate,
  onStatusChange,
  projectId,
  onEdit,
  onDelete, // يمكن الاحتفاظ بها في حالة الحاجة لمنطق حذف مباشر بدون تأكيد في مكان آخر
  isDraggable = false,
  onShowDiscussion,
  onShowDependencies,
  onConfirmDelete,
}: TaskItemProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSubtasks, setShowSubtasks] = useState(false);
  // لا نحتاج حالات محلية للحوارات بعد نقلها للأب
  // const [showDiscussion, setShowDiscussion] = useState(false);
  // const [showDependencies, setShowDependencies] = useState(false);
  // const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assigneeAttachment, setAssigneeAttachment] = useState<TaskAttachment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false); // يمكن الاحتفاظ بها لحالة زر الحذف

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    disabled: !isDraggable,
  });

  // تطبيق التحويل والانتقال من dnd-kit
  const dndStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const { canEdit } = usePermissionCheck({
    assignedTo: null,
    projectId: task.project_id,
    workspaceId: task.workspace_id,
    createdBy: task.created_by,
    isGeneral: task.is_general,
    projectManager: task.project_manager
  });

  const { dependencies, dependentTasks, checkDependenciesCompleted } = useTaskDependencies(task.id);

  const hasDependencies = dependencies.length > 0;
  const hasDependents = dependentTasks.length > 0;
  const hasPendingDependencies = hasDependencies && dependencies.some(d => d.status !== 'completed');

  const { hasNewDiscussion, hasDeliverables, hasTemplates, resetDiscussionFlag } = useTaskButtonStates(task.id);

  useEffect(() => {
    if (task.assigned_to) {
      fetchAssigneeAttachment();
    }
  }, [task.id, task.assigned_to]);

  const fetchAssigneeAttachment = async () => {
    try {
      // ... (نفس كود جلب المرفقات)
      const { data: portfolioAttachments, error: portfolioError } = await supabase
        .from("portfolio_task_attachments")
        .select("*")
        .eq("task_id", task.id)
        .eq("created_by", task.assigned_to)
        .order('created_at', { ascending: false })
        .limit(1);

      const { data: taskAttachments, error: taskError } = await supabase
        .from("task_attachments")
        .select("*")
        .eq("task_id", task.id)
        .eq("created_by", task.assigned_to)
        .order('created_at', { ascending: false })
        .limit(1);

      if ((portfolioAttachments && portfolioAttachments.length > 0) ||
        (taskAttachments && taskAttachments.length > 0)) {

        const attachment = portfolioAttachments?.length > 0
          ? portfolioAttachments[0]
          : taskAttachments![0];

        setAssigneeAttachment(attachment as TaskAttachment);
      }
    } catch (error) {
      console.error("Error fetching assignee attachment:", error);
    }
  };

  const handleDownload = (fileUrl: string, fileName: string) => {
    // ... (نفس كود التنزيل)
    const link = document.createElement('a');
    link.href = fileUrl;
    link.target = '_blank';
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
     e.stopPropagation();
     if (!canEdit) {
        toast.error("ليس لديك صلاحية لحذف هذه المهمة");
        return;
     }
     // استدعاء دالة رد النداء في الأب لفتح حوار التأكيد
     onConfirmDelete(task.id);
  };


  const handleStatusUpdate = async (newStatus: string) => {
    // ... (نفس كود تحديث الحالة بما في ذلك التحقق من المهام الفرعية والاعتماديات والمستلمات)
    if (!canEdit) {
      toast.error("ليس لديك صلاحية لتغيير حالة هذه المهمة");
      return;
    }

    setIsUpdating(true);
    try {
      if (newStatus === 'completed') {
        const { hasPendingSubtasks, error } = await checkPendingSubtasks(task.id);

        if (error) {
          toast.error(error);
          setIsUpdating(false);
          return;
        }

        if (hasPendingSubtasks) {
          toast.error("لا يمكن إكمال المهمة حتى يتم إكمال جميع المهام الفرعية");
          setIsUpdating(false);
          return;
        }

        if (task.requires_deliverable && !hasDeliverables) {
          toast.error("لا يمكن إكمال المهمة. المستلمات إلزامية لهذه المهمة", {
            description: "يرجى رفع مستلم واحد على الأقل قبل إكمال المهمة",
            duration: 5000,
          });
          setIsUpdating(false);
          return;
        }

        const dependencyCheck = await checkDependenciesCompleted(task.id);
        if (!dependencyCheck.isValid) {
          toast.error(dependencyCheck.message);
          if (dependencyCheck.pendingDependencies.length > 0) {
            const pendingTasks = dependencyCheck.pendingDependencies
              .map(task => task.title)
              .join(", ");
            toast.error(`المهام المعلقة: ${pendingTasks}`);
          }
          setIsUpdating(false);
          return;
        }
      }

      // استدعاء دالة رد النداء لتغيير الحالة في الأب
      await onStatusChange(task.id, newStatus);
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error("حدث خطأ أثناء تحديث حالة المهمة");
    } finally {
      setIsUpdating(false);
    }
  };

   const renderStatusChangeButton = () => {
     if (!canEdit) {
       return null;
     }

     return task.status !== 'completed' ? (
       <Button
         variant="outline"
         size="sm"
         className="h-7 w-7 p-0 ml-1"
         onClick={(e) => { e.stopPropagation(); handleStatusUpdate('completed'); }}
         disabled={isUpdating}
         title="إكمال المهمة"
       >
         <Check className="h-4 w-4" />
       </Button>
     ) : (
       <Button
         variant="outline"
         size="sm"
         className="h-7 w-7 p-0 ml-1"
         onClick={(e) => { e.stopPropagation(); handleStatusUpdate('in_progress'); }}
         disabled={isUpdating}
         title="إعادة فتح المهمة"
       >
         <AlertCircle className="h-4 w-4" />
       </Button>
     );
   };


  const handleDiscussionClick = (e: React.MouseEvent) => {
     e.stopPropagation();
     resetDiscussionFlag(); // يمكن الاحتفاظ بها هنا لتحديث حالة الزر محليًا
     // استدعاء دالة رد النداء في الأب لفتح حوار النقاش
     onShowDiscussion(task);
  };

  const handleDependenciesClick = (e: React.MouseEvent) => {
     e.stopPropagation();
     // استدعاء دالة رد النداء في الأب لفتح حوار الاعتماديات
     onShowDependencies(task);
  };

  const handleEditClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onEdit && canEdit) {
          onEdit(task);
      } else if (!canEdit) {
           toast.error("ليس لديك صلاحية لتعديل هذه المهمة");
      }
  }


  // منطق العرض الشرطي بناءً على isDraggable
  if (isDraggable) {
    return (
      // عرض المهمة كعنصر قابل للسحب (عادة ما يكون div)
      <>
        <div
          ref={setNodeRef}
          style={dndStyle}
          className={`p-4 bg-white rounded-md shadow-sm border ${isDragging ? 'ring-2 ring-primary' : ''} flex items-center justify-between gap-4`} // استخدام flexbox للعرض الأفقي
        >
          {/* مقبض السحب */}
          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-7 w-7 cursor-grab active:cursor-grabbing flex-shrink-0"
            {...attributes}
            {...listeners}
            title="اسحب لتغيير الترتيب"
          >
            <GripVertical className="h-4 w-4" />
          </Button>

          {/* المحتوى الرئيسي للمهمة (العنوان، الأزرار الداخلية) */}
          <div className="flex-grow flex items-center gap-4"> {/* دمج العناصر الأساسية */}
             <div className="font-medium flex items-center gap-2">
               {task.title}
               {/* زر المهام الفرعية */}
               <Button
                 variant="ghost"
                 size="sm"
                 className="p-0 h-7 w-7"
                 onClick={(e) => {
                   e.stopPropagation();
                   setShowSubtasks(!showSubtasks);
                 }}
                 title={showSubtasks ? "إخفاء المهام الفرعية" : "عرض المهام الفرعية"}
               >
                 {showSubtasks ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
               </Button>
               {/* زر الاعتماديات */}
               <Button
                 variant="ghost"
                 size="sm"
                 className={`p-0 h-7 w-7 ${(hasDependencies || hasDependents) ? 'bg-gray-50 hover:bg-gray-100' : ''}`}
                 onClick={handleDependenciesClick} // استخدام معالج جديد يستدعي callback الأب
                 title="إدارة اعتماديات المهمة"
               >
                 <DependencyIcon
                   hasDependencies={hasDependencies}
                   hasPendingDependencies={hasPendingDependencies}
                   hasDependents={hasDependents}
                   size={16}
                 />
               </Button>
             </div>

             {/* الشارات والتاريخ والمكلف */}
             <div className="flex items-center gap-2 flex-shrink-0">
                 {getStatusBadge(task.status)}
                 {renderStatusChangeButton()} {/* زر تغيير الحالة */}
                 {getPriorityBadge(task.priority)}
                  <div className="flex items-center gap-1 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    {task.assigned_user_name ? task.assigned_user_name : 'غير محدد'}
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {formatDate(task.due_date)}
                  </div>
             </div>
          </div>


          {/* أزرار الإجراءات (في نهاية السطر) */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* زر المناقشة */}
            <Button
              variant="ghost"
              size="sm"
              className={`p-0 h-7 w-7 ${
                hasNewDiscussion
                  ? "text-orange-500 hover:text-orange-600 hover:bg-orange-50"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={handleDiscussionClick} // استخدام معالج جديد يستدعي callback الأب
              title="مناقشة المهمة"
            >
              <MessageCircle className="h-4 w-4" />
            </Button>

            {/* زر تنزيل المرفق */}
            {assigneeAttachment && (
              <Button
                variant="ghost"
                size="sm"
                className={`p-0 h-7 w-7 ${
                  hasDeliverables
                    ? "text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={(e) => { e.stopPropagation(); handleDownload(assigneeAttachment.file_url, assigneeAttachment.file_name); }}
                title="تنزيل مرفق المكلف"
              >
                <Download className="h-4 w-4" />
              </Button>
            )}

            {/* زر التعديل */}
            {onEdit && canEdit && (
              <Button
                variant="ghost"
                size="sm"
                className="p-0 h-7 w-7"
                onClick={handleEditClick} // استخدام معالج جديد
                title="تعديل المهمة"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}

            {/* زر الحذف */}
            {onDelete && canEdit && ( // نتحقق من onDelete و canEdit قبل عرض الزر
              <Button
                variant="ghost"
                size="sm"
                className="p-0 h-7 w-7 text-red-500 hover:text-red-600"
                onClick={handleDeleteClick} // استخدام معالج جديد يستدعي callback الأب
                title="حذف المهمة"
                disabled={isDeleting} // يمكن تعطيله إذا كان الأب يمرر حالة الحذف
              >
                 {/* يمكن عرض أيقونة تحميل هنا إذا كان isDeleting true */}
                 {isDeleting ? <span className="animate-spin">...</span> : <Trash2 className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>

        {/* عرض المهام الفرعية أسفل العنصر الرئيسي إذا كانت مفتوحة */}
        {showSubtasks && (
           <div className="ml-8 mt-2 border-l pl-4"> {/* تباعد وتنسيق للتمييز */}
             <SubtasksList
               taskId={task.id}
               projectId={projectId}
             />
           </div>
        )}
        {/* ملاحظة: الحوارات لا تعرض هنا */}
      </>
    );
  }

  // عرض المهمة كصف في الجدول (الحالة الافتراضية)
  return (
    <>
      <TableRow ref={setNodeRef} style={dndStyle} className={`${isDragging ? 'opacity-50' : ''}`}> {/* تطبيق dndStyle على الصف */}
        {/* مقبض السحب لا يظهر في عرض الجدول عادة، ما لم يكن الجدول نفسه هو منطقة السحب */}
        {/* <TableCell className="w-8">
             {isDraggable && ( // يمكن إظهاره هنا إذا كان الصف هو العنصر القابل للسحب داخل جدول
              <Button variant="ghost" size="sm" className="p-0 h-7 w-7 cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
                 <GripVertical className="h-4 w-4" />
              </Button>
             )}
        </TableCell> */}
        <TableCell className="font-medium">
          <div className="flex items-center gap-2">
            {task.title}
            {/* زر المهام الفرعية */}
            <Button
              variant="ghost"
              size="sm"
              className="p-0 h-7 w-7 ml-2"
              onClick={(e) => {
                e.stopPropagation();
                setShowSubtasks(!showSubtasks);
              }}
              title={showSubtasks ? "إخفاء المهام الفرعية" : "عرض المهام الفرعية"}
            >
              {showSubtasks ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            {/* زر الاعتماديات */}
            <Button
              variant="ghost"
              size="sm"
              className={`p-0 h-7 w-7 ${(hasDependencies || hasDependents) ? 'bg-gray-50 hover:bg-gray-100' : ''}`}
              onClick={handleDependenciesClick} // استخدام معالج جديد يستدعي callback الأب
              title="إدارة اعتماديات المهمة"
            >
              <DependencyIcon
                hasDependencies={hasDependencies}
                hasPendingDependencies={hasPendingDependencies}
                hasDependents={hasDependents}
                size={16}
              />
            </Button>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center">
            {getStatusBadge(task.status)}
            {renderStatusChangeButton()} {/* زر تغيير الحالة */}
          </div>
        </TableCell>
        <TableCell>
          {getPriorityBadge(task.priority)}
        </TableCell>
        <TableCell>
          {task.assigned_user_name ? (
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 text-muted-foreground" />
              {task.assigned_user_name}
            </div>
          ) : (
            "غير محدد"
          )}
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-muted-foreground" />
            {formatDate(task.due_date)}
          </div>
        </TableCell>
        <TableCell className="text-right">
          <div className="flex items-center justify-end gap-1">
             {/* زر المناقشة */}
            <Button
              variant="ghost"
              size="sm"
              className={`p-0 h-7 w-7 ${
                hasNewDiscussion
                  ? "text-orange-500 hover:text-orange-600 hover:bg-orange-50"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={handleDiscussionClick} // استخدام معالج جديد يستدعي callback الأب
              title="مناقشة المهمة"
            >
              <MessageCircle className="h-4 w-4" />
            </Button>

            {/* زر تنزيل المرفق */}
            {assigneeAttachment && (
              <Button
                variant="ghost"
                size="sm"
                className={`p-0 h-7 w-7 ${
                  hasDeliverables
                    ? "text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={(e) => { e.stopPropagation(); handleDownload(assigneeAttachment.file_url, assigneeAttachment.file_name); }}
                title="تنزيل مرفق المكلف"
              >
                <Download className="h-4 w-4" />
              </Button>
            )}

            {/* زر التعديل */}
            {onEdit && canEdit && (
              <Button
                variant="ghost"
                size="sm"
                className="p-0 h-7 w-7"
                 onClick={handleEditClick} // استخدام معالج جديد
                title="تعديل المهمة"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}

            {/* زر الحذف */}
            {onDelete && canEdit && ( // نتحقق من onDelete و canEdit قبل عرض الزر
              <Button
                variant="ghost"
                size="sm"
                className="p-0 h-7 w-7 text-red-500 hover:text-red-600"
                onClick={handleDeleteClick} // استخدام معالج جديد يستدعي callback الأب
                title="حذف المهمة"
                 disabled={isDeleting} // يمكن تعطيله إذا كان الأب يمرر حالة الحذف
              >
                 {/* يمكن عرض أيقونة تحميل هنا إذا كان isDeleting true */}
                 {isDeleting ? <span className="animate-spin">...</span> : <Trash2 className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </TableCell>
      </TableRow>

      {/* عرض المهام الفرعية في صف منفصل أسفل الصف الرئيسي إذا كانت مفتوحة (في وضع الجدول) */}
      {showSubtasks && (
        <TableRow>
          <TableCell colSpan={6} className="py-0"> {/* تغطية جميع الأعمدة */}
            <div className="ml-6 border-l pl-4"> {/* تباعد وتنسيق للتمييز */}
              <SubtasksList
                taskId={task.id}
                projectId={projectId}
              />
            </div>
          </TableCell>
        </TableRow>
      )}

      {/* ملاحظة: الحوارات لا تعرض هنا */}
    </>
  );
};
