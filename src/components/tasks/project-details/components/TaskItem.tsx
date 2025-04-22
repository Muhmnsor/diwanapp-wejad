/**
 * TaskItem.tsx
 * مكوّن صفّ مهمة مع كل وظائفه (تحديث الحالة، المناقشة، الاعتماديات، الحذف …)
 * ✔︎ يعالج خطأ استدعاء الـ Hook داخل event handler
 * ✔︎ يستخدم useTaskDependencyManager مرة واحدة في المستوى الأعلى
 * ✔︎ يعيد فتح المهمة إلى "pending" (عدّلها إذا كانت لديك قيمة مختلفة)
 */

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Users,
  Check,
  Clock,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Download,
  Trash2,
  Edit,
} from "lucide-react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { SubtasksList } from "./subtasks/SubtasksList";
import { checkPendingSubtasks } from "../services/subtasksService";
import { TaskDiscussionDialog } from "../../components/TaskDiscussionDialog";
import { TaskDependenciesDialog } from "./dependencies/TaskDependenciesDialog";
import { usePermissionCheck } from "../hooks/usePermissionCheck";
import { DependencyIcon } from "../../components/dependencies/DependencyIcon";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useTaskDependencyManager } from "../../components/dependencies/TaskDependencyManager";

interface TaskItemProps {
  task: any; // ✴︎ استبدل بـ Type دقيقة إن توفرت
  getStatusBadge: (status: string) => JSX.Element;
  getPriorityBadge: (priority: string | null) => JSX.Element | null;
  formatDate: (date: string | null) => string;
  onStatusChange: (taskId: string, status: string) => Promise<void>;
  projectId: string;
  onEdit?: (task: any) => void;
  onDelete?: (taskId: string) => void;
}

export const TaskItem = ({
  task,
  getStatusBadge,
  getPriorityBadge,
  formatDate,
  onStatusChange,
  projectId,
  onEdit,
  onDelete,
}: TaskItemProps) => {
  /* ------------------------------------------------------------------ */
  /* »» الحالة الداخلية                                                  */
  /* ------------------------------------------------------------------ */
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [showDiscussion, setShowDiscussion] = useState(false);
  const [showDependencies, setShowDependencies] = useState(false);
  const [assigneeAttachment, setAssigneeAttachment] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasNewDiscussion, setHasNewDiscussion] = useState(false);
  const [hasDeliverables, setHasDeliverables] = useState(false);

  /* ------------------------------------------------------------------ */
  /* »» البيانات المشتركة                                                 */
  /* ------------------------------------------------------------------ */
  const { user } = useAuthStore();

  /** صلاحيات التعديل / الحذف */
  const { canEdit } = usePermissionCheck({
    assignedTo: null,
    projectId: task.project_id,
    workspaceId: task.workspace_id,
    createdBy: task.created_by,
    isGeneral: task.is_general,
    projectManager: task.project_manager,
  });

  /** إدارة الاعتماديات – استدعاء واحد فقط في أعلى المكوّن */
  const {
    hasDependencies,
    hasDependents,
    hasPendingDependencies,
    checkDependenciesCompleted,
  } = useTaskDependencyManager({ taskId: task.id });

  /* ------------------------------------------------------------------ */
  /* »» سحب‑وإفلات                                                       */
  /* ------------------------------------------------------------------ */
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  /* ------------------------------------------------------------------ */
  /* »» جلب مرفق المكلَّف                                               */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (task.assigned_to) fetchAssigneeAttachment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task.id, task.assigned_to]);

  const fetchAssigneeAttachment = async () => {
    try {
      const { data: portfolioAttachments } = await supabase
        .from("portfolio_task_attachments")
        .select("*")
        .eq("task_id", task.id)
        .eq("created_by", task.assigned_to)
        .order("created_at", { ascending: false })
        .limit(1);

      const { data: taskAttachments } = await supabase
        .from("task_attachments")
        .select("*")
        .eq("task_id", task.id)
        .eq("created_by", task.assigned_to)
        .order("created_at", { ascending: false })
        .limit(1);

      const attachment =
        portfolioAttachments?.[0] ?? taskAttachments?.[0] ?? null;

      setAssigneeAttachment(attachment);
      setHasDeliverables(!!attachment);
    } catch (error) {
      console.error("Error fetching assignee attachment:", error);
    }
  };

  const handleDownload = (fileUrl: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.target = "_blank";
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* ------------------------------------------------------------------ */
  /* »» حذف المهمة                                                       */
  /* ------------------------------------------------------------------ */
  const handleDelete = async () => {
    if (!onDelete || !canEdit) {
      if (!canEdit) toast.error("ليس لديك صلاحية لحذف هذه المهمة");
      return;
    }

    try {
      setIsDeleting(true);
      await onDelete(task.id);
      setDeleteDialogOpen(false);
    } catch {
      toast.error("حدث خطأ أثناء حذف المهمة");
    } finally {
      setIsDeleting(false);
    }
  };

  /* ------------------------------------------------------------------ */
  /* »» تحديث حالة المهمة                                                */
  /* ------------------------------------------------------------------ */
  const handleStatusUpdate = async (newStatus: string) => {
    if (!canEdit) {
      toast.error("ليس لديك صلاحية لتغيير حالة هذه المهمة");
      return;
    }

    setIsUpdating(true);

    try {
      /* شروط عند الإكمال فقط */
      if (newStatus === "completed") {
        /* تحقق من المهام الفرعية */
        const { hasPendingSubtasks, error } = await checkPendingSubtasks(
          task.id
        );
        if (error) throw new Error(error);
        if (hasPendingSubtasks) {
          toast.error("لا يمكن إكمال المهمة حتى يتم إكمال جميع المهام الفرعية");
          return;
        }

        /* تحقق من المستلَمات */
        if (task.requires_deliverable && !hasDeliverables) {
          toast.error("المستلمات إلزامية لهذه المهمة", {
            description: "يرجى رفع مستلم واحد على الأقل قبل الإكمال",
            duration: 5000,
          });
          return;
        }

        /* تحقق من الاعتماديات */
        const dependencyCheck = await checkDependenciesCompleted();
        if (!dependencyCheck.isValid) {
          toast.error(dependencyCheck.message);
          if (dependencyCheck.pendingDependencies.length) {
            const pending = dependencyCheck.pendingDependencies
              .map((t: any) => t.title)
              .join(", ");
            toast.error(`المهام المعلقة: ${pending}`);
          }
          return;
        }
      }

      /* استدعاء الدالة المرسلة من الأب */
      await onStatusChange(task.id, newStatus);
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error("حدث خطأ أثناء تحديث حالة المهمة");
    } finally {
      setIsUpdating(false);
    }
  };

  /* ------------------------------------------------------------------ */
  /* »» أزرار الحالة                                                     */
  /* ------------------------------------------------------------------ */
  const renderStatusChangeButton = () => {
    if (!canEdit) return null;

    return task.status !== "completed" ? (
      <Button
        variant="outline"
        size="sm"
        className="h-7 w-7 p-0 ml-1"
        onClick={() => handleStatusUpdate("completed")}
        disabled={isUpdating}
        title="إكمال المهمة"
      >
        <Check className="h-3.5 w-3.5 text-green-500" />
      </Button>
    ) : (
      <Button
        variant="outline"
        size="sm"
        className="h-7 w-7 p-0 ml-1"
        onClick={() => handleStatusUpdate("pending")} // ← غيّر القيمة إن كانت مختلفة لديك
        disabled={isUpdating}
        title="إعادة فتح المهمة"
      >
        <Clock className="h-3.5 w-3.5 text-amber-500" />
      </Button>
    );
  };

  /* ------------------------------------------------------------------ */
  /* »» واجهة المكوّن                                                    */
  /* ------------------------------------------------------------------ */
  return (
    <>
      {/* الصفّ الرئيسي */}
      <TableRow ref={setNodeRef} style={style} {...attributes} {...listeners}>
        {/* العنوان + أزرار إظهار التفاصيل */}
        <TableCell className="font-medium flex items-center">
          {task.title}

          {/* زر عرض/إخفاء المهام الفرعية */}
          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-7 w-7 ml-2"
            onClick={(e) => {
              e.stopPropagation();
              setShowSubtasks((p) => !p);
            }}
            title={showSubtasks ? "إخفاء المهام الفرعية" : "عرض المهام الفرعية"}
          >
            {showSubtasks ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </Button>

          {/* زر الاعتماديات */}
          <Button
            variant="ghost"
            size="sm"
            className={`p-0 h-7 w-7 ${
              hasDependencies || hasDependents ? "bg-gray-50 hover:bg-gray-100" : ""
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setShowDependencies(true);
            }}
            title="إدارة اعتماديات المهمة"
          >
            <DependencyIcon
              hasDependencies={hasDependencies}
              hasPendingDependencies={hasPendingDependencies}
              hasDependents={hasDependents}
              size={16}
            />
          </Button>
        </TableCell>

        {/* الحالة */}
        <TableCell>
          <div className="flex items-center gap-2">
            {getStatusBadge(task.status)}
            {renderStatusChangeButton()}
          </div>
        </TableCell>

        {/* الأولوية */}
        <TableCell>{getPriorityBadge(task.priority)}</TableCell>

        {/* المكلَّف */}
        <TableCell>
          {task.assigned_user_name ? (
            <div className="flex items-center">
              <Users className="h-3.5 w-3.5 ml-1.5 text-gray-500" />
              {task.assigned_user_name}
            </div>
          ) : (
            <span className="text-gray-400">غير محدد</span>
          )}
        </TableCell>

        {/* تاريخ الاستحقاق */}
        <TableCell>
          <div className="flex items-center">
            <Calendar className="h-3.5 w-3.5 ml-1.5 text-gray-500" />
            {formatDate(task.due_date)}
          </div>
        </TableCell>

        {/* أزرار جانبية (مناقشة ‑ مرفق المكلَّف ‑ تعديل ‑ حذف) */}
        <TableCell>
          <div className="flex items-center gap-1">
            {/* مناقشة */}
            <Button
              variant="ghost"
              size="sm"
              className={`p-0 h-7 w-7 ${
                hasNewDiscussion
                  ? "text-orange-500 hover:text-orange-600 hover:bg-orange-50"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setHasNewDiscussion(false);
                setShowDiscussion(true);
              }}
              title="مناقشة المهمة"
            >
              <MessageCircle className="h-4 w-4" />
            </Button>

            {/* تنزيل مرفق المكلف */}
            {assigneeAttachment && (
              <Button
                variant="ghost"
                size="sm"
                className={`p-0 h-7 w-7 ${
                  hasDeliverables
                    ? "text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(
                    assigneeAttachment.file_url,
                    assigneeAttachment.file_name
                  );
                }}
                title="تنزيل مرفق المكلف"
              >
                <Download className="h-4 w-4" />
              </Button>
            )}

            {/* تعديل */}
            {onEdit && canEdit && (
              <Button
                variant="ghost"
                size="sm"
                className="p-0 h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(task);
                }}
                title="تعديل المهمة"
              >
                <Edit className="h-4 w-4 text-amber-500 hover:text-amber-700" />
              </Button>
            )}

            {/* حذف */}
            {onDelete && canEdit && (
              <Button
                variant="ghost"
                size="sm"
                className="p-0 h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteDialogOpen(true);
                }}
                title="حذف المهمة"
              >
                <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" />
              </Button>
            )}
          </div>
        </TableCell>
      </TableRow>

      {/* صفّ المهام الفرعية */}
      {showSubtasks && (
        <TableRow>
          <TableCell colSpan={6} className="bg-gray-50 p-0">
            <div className="p-3">
              <SubtasksList taskId={task.id} projectId={projectId} />
            </div>
          </TableCell>
        </TableRow>
      )}

      {/* حوار المناقشة */}
      <TaskDiscussionDialog
        open={showDiscussion}
        onOpenChange={setShowDiscussion}
        task={task}
        onStatusChange={onStatusChange}
      />

      {/* حوار الاعتماديات */}
      <TaskDependenciesDialog
        open={showDependencies}
        onOpenChange={setShowDependencies}
        task={task}
        projectId={projectId}
      />

      {/* تأكيد الحذف */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف هذه المهمة؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف المهمة وجميع المهام الفرعية والمرفقات المرتبطة بها بشكل
              نهائي. لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? "جاري الحذف..." : "تأكيد الحذف"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
