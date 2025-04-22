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
  Edit
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
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useTaskDependencyManager } from "../../components/dependencies/TaskDependencyManager";
import { useTaskDependencies } from "../hooks/useTaskDependencies";

interface TaskItemProps {
  task: any; // replace with proper Task type if available
  projectId: string;
  getStatusBadge: (status: string) => JSX.Element;
  getPriorityBadge: (priority: string | null) => JSX.Element | null;
  formatDate: (date: string | null) => string;
  onStatusChange: (taskId: string, newStatus: string) => Promise<void>;
  onEdit?: (task: any) => void; // replace with proper Task type if available
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
  onDelete
}: TaskItemProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [showDiscussion, setShowDiscussion] = useState(false);
  const [showDependencies, setShowDependencies] = useState(false);
  const [assigneeAttachment, setAssigneeAttachment] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasNewDiscussion, setHasNewDiscussion] = useState(false);
  const [hasDeliverables, setHasDeliverables] = useState(false);

  const { user } = useAuthStore();
  const { checkDependenciesCompleted } = useTaskDependencies(task.id);

  // dnd-kit sortable setup
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({
    id: task.id
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  const { canEdit } = usePermissionCheck({
    assignedTo: null,
    projectId: task.project_id,
    workspaceId: task.workspace_id,
    createdBy: task.created_by,
    isGeneral: task.is_general,
    projectManager: task.project_manager
  });

  /* -------------------------------------------------------------------------- */
  /*                               Side effects                                 */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    if (task.assigned_to) {
      fetchAssigneeAttachment();
    }
  }, [task.id, task.assigned_to]);

  useEffect(() => {
    setHasDeliverables(!!assigneeAttachment);
  }, [assigneeAttachment]);

  /* -------------------------------------------------------------------------- */
  /*                              Helper methods                                */
  /* -------------------------------------------------------------------------- */
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

      if (
        (portfolioAttachments && portfolioAttachments.length > 0) ||
        (taskAttachments && taskAttachments.length > 0)
      ) {
        const attachment =
          portfolioAttachments?.length! > 0
            ? portfolioAttachments![0]
            : taskAttachments![0];
        setAssigneeAttachment(attachment);
      } else {
        setAssigneeAttachment(null);
      }
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

  const resetDiscussionFlag = () => setHasNewDiscussion(false);

  const handleDelete = async () => {
    if (!onDelete || !canEdit) {
      if (!canEdit) toast.error("ليس لديك صلاحية لحذف هذه المهمة");
      return;
    }

    setIsDeleting(true);
    try {
      onDelete(task.id);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("حدث خطأ أثناء حذف المهمة");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!canEdit) {
      toast.error("ليس لديك صلاحية لتغيير حالة هذه المهمة");
      return;
    }

    setIsUpdating(true);
    try {
      if (newStatus === "completed") {
        // 1) ensure no pending subtasks
        const { hasPendingSubtasks, error } = await checkPendingSubtasks(task.id);
        if (error) throw new Error(error);
        if (hasPendingSubtasks) {
          toast.error("لا يمكن إكمال المهمة حتى يتم إكمال جميع المهام الفرعية");
          setIsUpdating(false);
          return;
        }

        // 2) ensure deliverables uploaded (if required)
        if (task.requires_deliverable && !hasDeliverables) {
          toast.error("لا يمكن إكمال المهمة. المستلمات إلزامية لهذه المهمة", {
            description: "يرجى رفع مستلم واحد على الأقل قبل إكمال المهمة",
            duration: 5000
          });
          setIsUpdating(false);
          return;
        }

        // 3) ensure dependencies completed
        const { checkDependenciesCompleted } = useTaskDependencyManager({
          taskId: task.id
        });
        const dependencyCheck = await checkDependenciesCompleted(task.id);
        if (!dependencyCheck.isValid) {
          toast.error(dependencyCheck.message);
          if (dependencyCheck.pendingDependencies.length > 0) {
            const pendingTitles = dependencyCheck.pendingDependencies
              .map((t: any) => t.title)
              .join(", ");
            toast.error(`المهام المعلقة: ${pendingTitles}`);
          }
          setIsUpdating(false);
          return;
        }
      }

      await onStatusChange(task.id, newStatus);
    } catch (err) {
      console.error("Error updating task status:", err);
      toast.error("حدث خطأ أثناء تحديث حالة المهمة");
    } finally {
      setIsUpdating(false);
    }
  };

  const renderStatusChangeButton = () =>
    canEdit ? (
      task.status !== "completed" ? (
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
          onClick={() => handleStatusUpdate("in_progress")}
          disabled={isUpdating}
          title="إعادة فتح المهمة"
        >
          <Clock className="h-3.5 w-3.5 text-amber-500" />
        </Button>
      )
    ) : null;

  const handleShowDiscussion = () => {
    resetDiscussionFlag();
    setShowDiscussion(true);
  };

  const { hasDependencies, hasDependents, hasPendingDependencies } =
    useTaskDependencyManager({ taskId: task.id });

  /* -------------------------------------------------------------------------- */
  /*                                   Render                                   */
  /* -------------------------------------------------------------------------- */
  return (
    <>
      {/* ----------------------------- Main Row ----------------------------- */}
      <TableRow ref={setNodeRef} style={style} {...attributes} {...listeners}>
        {/* Title cell */}
        <TableCell className="font-medium flex items-center">
          {task.title}
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
            {showSubtasks ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </Button>
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

        {/* Status */}
        <TableCell>
          <div className="flex items-center gap-2">
            {getStatusBadge(task.status)}
            {renderStatusChangeButton()}
          </div>
        </TableCell>

        {/* Priority */}
        <TableCell>{getPriorityBadge(task.priority)}</TableCell>

        {/* Assignee */}
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

        {/* Due date */}
        <TableCell>
          <div className="flex items-center">
            <Calendar className="h-3.5 w-3.5 ml-1.5 text-gray-500" />
            {formatDate(task.due_date)}
          </div>
        </TableCell>

        {/* Actions */}
        <TableCell>
          <div className="flex items-center gap-1">
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
                handleShowDiscussion();
              }}
              title="مناقشة المهمة"
            >
              <MessageCircle className="h-4 w-4" />
            </Button>

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

      {/* ----------------------------- Subtasks ----------------------------- */}
      {showSubtasks && (
        <TableRow>
          <TableCell colSpan={6} className="bg-gray-50 p-0">
            <div className="p-3">
              <SubtasksList taskId={task.id} projectId={projectId} />
            </div>
          </TableCell>
        </TableRow>
      )}

      {/* ------------------------------ Dialogs ------------------------------ */}
      <TaskDiscussionDialog
        open={showDiscussion}
        onOpenChange={setShowDiscussion}
        task={task}
        onStatusChange={onStatusChange}
      />

      <TaskDependenciesDialog
        open={showDependencies}
        onOpenChange={setShowDependencies}
        task={task}
        projectId={projectId}
      />

      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف هذه المهمة؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف المهمة وجميع المهام الفرعية والمرفقات المرتبطة بها بشكل نهائي.
              لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              إلغاء
            </AlertDialogCancel>
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
