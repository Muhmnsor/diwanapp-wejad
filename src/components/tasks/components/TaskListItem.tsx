
import { useState, Fragment } from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Paperclip, Upload, MessageCircle, FileDown } from "lucide-react";
import { TaskActionButtons } from "./actions/TaskActionButtons";
import { TaskHeader } from "./TaskHeader";
import { DiscussionDialog } from "../dialogs/DiscussionDialog";
import { AttachmentsDialog } from "../dialogs/AttachmentsDialog";
import { FileUploadDialog } from "../dialogs/FileUploadDialog";
import { TemplatesDialog } from "../dialogs/TemplatesDialog";
import { Task } from "../types/task";
import { Badge } from "@/components/ui/badge";
import { useTaskAssignmentNotifications } from "@/hooks/useTaskAssignmentNotifications";
import { useAuthStore } from "@/store/authStore";
import { EditTaskDialog } from "../project-details/EditTaskDialog";
import type { Task as ProjectTask } from "../project-details/types/task";
import { useTaskPermissions } from "../hooks/useTaskPermissions";

interface TaskListItemProps {
  task: Task;
  onStatusChange: (status: string) => void;
  isUpdating: boolean;
  onDelete?: () => void;
  currentUserId?: string;
  onTaskUpdated?: () => void;
  isGeneral?: boolean;
}

export const TaskListItem = ({
  task,
  onStatusChange,
  isUpdating,
  onDelete,
  currentUserId,
  onTaskUpdated,
  isGeneral = false
}: TaskListItemProps) => {
  const [isDiscussionOpen, setIsDiscussionOpen] = useState(false);
  const [isAttachmentsOpen, setIsAttachmentsOpen] = useState(false);
  const [isFileUploadOpen, setIsFileUploadOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { user } = useAuthStore();
  const { notifyTaskAssignment } = useTaskAssignmentNotifications();
  
  // Use the task permissions hook
  const { canEdit, canDelete, canChangeStatus } = useTaskPermissions({
    taskId: task.id,
    assignedTo: task.assigned_to,
    createdBy: task.created_by
  });

  const currentStatus = task.status || "pending";
  
  const formattedDate = task.due_date
    ? format(new Date(task.due_date), "d MMMM yyyy", { locale: ar })
    : "غير محدد";

  const showDiscussion = () => {
    setIsDiscussionOpen(true);
  };

  const openFileUploader = () => {
    setIsFileUploadOpen(true);
  };

  const openAttachments = () => {
    setIsAttachmentsOpen(true);
  };

  const openTemplates = () => {
    setIsTemplatesOpen(true);
  };

  const handleTaskUpdated = () => {
    setIsEditDialogOpen(false);
    if (onTaskUpdated) {
      onTaskUpdated();
    }
  };

  const handleTaskEdited = () => {
    setIsEditDialogOpen(true);
  };

  const handleAssigneeChange = async (assigneeId: string) => {
    // Notify the assignee if there's a change and not current user
    if (assigneeId && task.assigned_to !== assigneeId && assigneeId !== user?.id) {
      try {
        await notifyTaskAssignment(task.id, task.title, assigneeId);
      } catch (error) {
        console.error("Failed to notify task assignment:", error);
      }
    }
  };

  // Convert to the ProjectTask type for EditTaskDialog
  const adaptTaskForEditDialog = (): ProjectTask => {
    return {
      ...task,
      description: task.description || null, // Ensure description is never undefined
      status: task.status || "pending",
      priority: task.priority || null,
      due_date: task.due_date || null,
      assigned_to: task.assigned_to || null,
      created_at: task.created_at || new Date().toISOString(),
      stage_id: task.stage_id || null
    };
  };

  return (
    <div className="bg-card hover:bg-accent/5 border rounded-lg p-4 transition-colors">
      <TaskHeader task={task} status={currentStatus} />
      
      <div className="mt-3">
        <p className="text-sm text-gray-600 line-clamp-2">
          {task.description || "لا يوجد وصف للمهمة"}
        </p>
      </div>
      
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-gray-500">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <span className="ml-1 font-medium">التاريخ:</span>
            {formattedDate}
          </div>
          
          {task.assigned_user_name && (
            <div>
              <span className="ml-1 font-medium">المكلف:</span>
              {task.assigned_user_name}
            </div>
          )}
          
          {task.created_by && task.creator_name && (
            <div>
              <span className="ml-1 font-medium">المنشئ:</span>
              {task.creator_name}
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          {task.priority && (
            <Badge
              variant="outline"
              className={`${
                task.priority === 'high'
                  ? 'border-red-500 text-red-500'
                  : task.priority === 'medium'
                  ? 'border-amber-500 text-amber-500'
                  : 'border-green-500 text-green-500'
              }`}
            >
              {task.priority === 'high'
                ? 'عالية'
                : task.priority === 'medium'
                ? 'متوسطة'
                : 'منخفضة'}
            </Badge>
          )}
        </div>
      </div>

      <TaskActionButtons
        currentStatus={currentStatus}
        isUpdating={isUpdating}
        onShowDiscussion={showDiscussion}
        onOpenFileUploader={openFileUploader}
        onOpenAttachments={openAttachments}
        onStatusChange={onStatusChange}
        onOpenTemplates={openTemplates}
        onDelete={onDelete}
        onEdit={handleTaskEdited}
        taskId={task.id}
        isGeneral={isGeneral}
        canEdit={canEdit}
        canDelete={canDelete}
        canChangeStatus={canChangeStatus}
      />

      {isDiscussionOpen && (
        <DiscussionDialog
          open={isDiscussionOpen}
          onOpenChange={setIsDiscussionOpen}
          taskId={task.id}
          isGeneral={isGeneral}
        />
      )}

      {isFileUploadOpen && (
        <FileUploadDialog
          open={isFileUploadOpen}
          onOpenChange={setIsFileUploadOpen}
          taskId={task.id}
        />
      )}

      {isAttachmentsOpen && (
        <AttachmentsDialog
          open={isAttachmentsOpen}
          onOpenChange={setIsAttachmentsOpen}
          taskId={task.id}
        />
      )}

      {isTemplatesOpen && (
        <TemplatesDialog
          open={isTemplatesOpen}
          onOpenChange={setIsTemplatesOpen}
          taskId={task.id}
        />
      )}

      {isEditDialogOpen && (
        <EditTaskDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          task={adaptTaskForEditDialog()}
          projectStages={[]}
          projectMembers={[]}
          onTaskUpdated={handleTaskUpdated}
          onAssigneeChange={handleAssigneeChange}
          isGeneral={isGeneral}
        />
      )}
    </div>
  );
};
