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
import { TaskDiscussionDialog } from "../../components/TaskDiscussionDialog";
import { TaskDependenciesDialog } from "./dependencies/TaskDependenciesDialog";
import { useTaskDependencies } from "../hooks/useTaskDependencies";
import { usePermissionCheck } from "../hooks/usePermissionCheck";
import { useTaskButtonStates } from "../../hooks/useTaskButtonStates";
import { DependencyIcon } from "../../components/dependencies/DependencyIcon";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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

interface TaskItemProps {
  task: Task;
  getStatusBadge: (status: string) => JSX.Element;
  getPriorityBadge: (priority: string | null) => JSX.Element | null;
  formatDate: (date: string | null) => string;
  onStatusChange: (taskId: string, newStatus: string) => void;
  projectId: string;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  isDraggable?: boolean; // أضف هذه الخاصية
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
  onDelete,
  isDraggable = false, // تعيين قيمة افتراضية
}: TaskItemProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [showDiscussion, setShowDiscussion] = useState(false);
  const [showDependencies, setShowDependencies] = useState(false);
  const [assigneeAttachment, setAssigneeAttachment] = useState<TaskAttachment | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuthStore();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    disabled: !isDraggable, // تعطيل السحب إذا لم يكن draggable
  });

  const style = {
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
    projectManager: task.project_manager // إضافة projectManager
  });

  const { dependencies, dependentTasks, checkDependenciesCompleted } = useTaskDependencies(task.id);

  const hasDependencies = dependencies.length > 0;
  const hasDependents = dependentTasks.length > 0;
  const hasPendingDependencies = hasDependencies && dependencies.some(d => d.status !== 'completed');

  const dependencyIconColor = hasDependencies && dependencies.some(d => d.status !== 'completed')
    ? 'text-amber-500'
    : hasDependencies || hasDependents
      ? 'text-blue-500'
      : 'text-gray-500';

  const { hasNewDiscussion, hasDeliverables, hasTemplates, resetDiscussionFlag } = useTaskButtonStates(task.id);

  useEffect(() => {
    if (task.assigned_to) {
      fetchAssigneeAttachment();
    }
  }, [task.id, task.assigned_to]);

  const fetchAssigneeAttachment = async () => {
    try {
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
    const link = document.createElement('a');
    link.href = fileUrl;
    link.target = '_blank';
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async () => {
    if (!onDelete || !canEdit) {
      if (!canEdit) {
        toast.error("ليس لديك صلاحية لحذف هذه المهمة");
      }
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
        onClick={() => handleStatusUpdate('completed')}
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
        onClick={() => handleStatusUpdate('in_progress')}
        disabled={isUpdating}
        title="إعادة فتح المهمة"
      >
        <AlertCircle className="h-4 w-4" />
      </Button>
    );
  };

  const handleShowDiscussion = () => {
    resetDiscussionFlag();
    setShowDiscussion(true);
  };

  const TaskContent = () => (
    <>
      {isDraggable && (
        <Button
          variant="ghost"
          size="sm"
          className="p-0 h-7 w-7 cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
          title="اسحب لتغيير الترتيب"
        >
          <GripVertical className="h-4 w-4" />
        </Button>
      )}
      <div className="flex items-center gap-2">
        <div>{task.title}</div>
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
          {showSubtasks ?
            <ChevronUp className="h-4 w-4" /> :
            <ChevronDown className="h-4 w-4" />
          }
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={`p-0 h-7 w-7 ${(hasDependencies || hasDependents) ? 'bg-gray-50 hover:bg-gray-100' : ''}`}
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
      </div>
      {!isDraggable && ( // Render status and change button in table cell only when not draggable
        <div className="flex items-center">
          {getStatusBadge(task.status)}
          {renderStatusChangeButton()}
        </div>
      )}
      {getPriorityBadge(task.priority)}
      <div className="flex items-center gap-1">
        <Users className="h-4 w-4 text-muted-foreground" />
        {task.assigned_user_name ? (
          <span>{task.assigned_user_name}</span>
        ) : (
          <span>غير محدد</span>
        )}
      </div>
      <div className="flex items-center gap-1">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span>{formatDate(task.due_date)}</span>
      </div>
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
              handleDownload(assigneeAttachment.file_url, assigneeAttachment.file_name);
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
            <Edit className="h-4 w-4" />
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
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </>
  );

  if (isDraggable) {
    return (
      <>
        <div
          ref={setNodeRef}
          style={style}
          className={`p-4 bg-white rounded-md shadow-sm border ${isDragging ? 'ring-2 ring-primary' : ''} flex flex-col gap-2`} // Use flexbox for layout
        >
          <div className="flex items-center justify-between"> {/* Top row: Drag handle, Title, Subtasks toggle, Dependencies, Actions */}
            <div className="flex items-center gap-2 flex-grow"> {/* Title, Subtasks, Dependencies */}
               {TaskContent()}
            </div>
             <div className="flex items-center gap-2 ml-auto"> {/* Status, Priority, Assignee, Due Date, Actions */}
               <div className="flex items-center">
                  {getStatusBadge(task.status)}
                  {renderStatusChangeButton()}
               </div>
               {getPriorityBadge(task.priority)}
               <div className="flex items-center gap-1">
                 <Users className="h-4 w-4 text-muted-foreground" />
                 <span>{task.assigned_user_name ? task.assigned_user_name : 'غير محدد'}</span>
               </div>
               <div className="flex items-center gap-1">
                 <Clock className="h-4 w-4 text-muted-foreground" /> {/* Changed Calendar to Clock based on common date icons */}
                 <span>{formatDate(task.due_date)}</span>
               </div>
                {/* Render action buttons here */}
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
                           handleDownload(assigneeAttachment.file_url, assigneeAttachment.file_name);
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
                         <Edit className="h-4 w-4" />
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
                         <Trash2 className="h-4 w-4" />
                       </Button>
                     )}
                  </div>
             </div>
          </div>

          {showSubtasks && (
             <div className="ml-6 border-l pl-4">
               <SubtasksList
                 taskId={task.id}
                 projectId={projectId}
               />
             </div>
          )}

        </div>

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

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>هل أنت متأكد من حذف هذه المهمة؟</AlertDialogTitle>
              <AlertDialogDescription>
                سيتم حذف المهمة وجميع المهام الفرعية والمرفقات المرتبطة بها بشكل نهائي.
                لا يمكن التراجع عن هذا الإجراء.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
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
  }

  return (
    <>
      <TableRow ref={setNodeRef} style={style} className={`${isDragging ? 'opacity-50' : ''}`}>
        <TableCell className="font-medium flex items-center">
           {/* Keep drag handle here if it's a table, but only when draggable is true - however, dnd-kit usually works best when the whole item is the draggable element.
           Let's assume the table itself is not the sortable context here, and this component is used in two places: one for the table and one for the draggable list.
           So, the drag handle only appears in the draggable context.
           */}
          <div className="flex items-center gap-2">
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
              {showSubtasks ?
                <ChevronUp className="h-4 w-4" /> :
                <ChevronDown className="h-4 w-4" />
              }
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className={`p-0 h-7 w-7 ${(hasDependencies || hasDependents) ? 'bg-gray-50 hover:bg-gray-100' : ''}`}
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
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center">
            {getStatusBadge(task.status)}
            {renderStatusChangeButton()}
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
            <Clock className="h-4 w-4 text-muted-foreground" /> {/* Changed Calendar to Clock based on common date icons */}
            {formatDate(task.due_date)}
          </div>
        </TableCell>
        <TableCell className="text-right">
          <div className="flex items-center justify-end gap-1">
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
                  handleDownload(assigneeAttachment.file_url, assigneeAttachment.file_name);
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
                <Edit className="h-4 w-4" />
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
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </TableCell>
      </TableRow>

      {showSubtasks && (
        <TableRow>
          <TableCell colSpan={6} className="py-0">
            <div className="ml-6 border-l pl-4">
              <SubtasksList
                taskId={task.id}
                projectId={projectId}
              />
            </div>
          </TableCell>
        </TableRow>
      )}

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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف هذه المهمة؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف المهمة وجميع المهام الفرعية والمرفقات المرتبطة بها بشكل نهائي.
              لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
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
