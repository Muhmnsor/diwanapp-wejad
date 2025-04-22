import { Calendar, Users, Check, Clock, AlertCircle, ChevronDown, ChevronUp, MessageCircle, Download, Trash2, Edit, Link2 } from "lucide-react";
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
  onDelete
}: TaskItemProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [showDiscussion, setShowDiscussion] = useState(false);
  const [showDependencies, setShowDependencies] = useState(false);
  const [assigneeAttachment, setAssigneeAttachment] = useState<TaskAttachment | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuthStore();
  
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
        <Check className="h-3.5 w-3.5 text-green-500" />
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
        <Clock className="h-3.5 w-3.5 text-amber-500" />
      </Button>
    );
  };

  const handleShowDiscussion = () => {
    resetDiscussionFlag();
    setShowDiscussion(true);
  };

  return (
    <>
      <TableRow key={task.id} className="cursor-pointer hover:bg-gray-50">
        <TableCell className="font-medium">
          <div className="flex items-center">
            <span className="mr-1">{task.title}</span>
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
                <ChevronUp className="h-4 w-4 text-gray-500" /> : 
                <ChevronDown className="h-4 w-4 text-gray-500" />
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
          <div className="flex items-center gap-2">
            {getStatusBadge(task.status)}
            {renderStatusChangeButton()}
          </div>
        </TableCell>
        <TableCell>{getPriorityBadge(task.priority)}</TableCell>
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
        <TableCell>
          <div className="flex items-center">
            <Calendar className="h-3.5 w-3.5 ml-1.5 text-gray-500" />
            {formatDate(task.due_date)}
          </div>
        </TableCell>
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
      
      {showSubtasks && (
        <TableRow>
          <TableCell colSpan={6} className="bg-gray-50 p-0">
            <div className="p-3">
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
