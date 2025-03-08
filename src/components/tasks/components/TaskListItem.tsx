
import { useState, useEffect } from "react";
import { Task } from "../types/task";
import { TaskHeader } from "./header/TaskHeader";
import { TaskMetadata } from "./metadata/TaskMetadata";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TaskDiscussionDialog } from "./TaskDiscussionDialog";
import { TaskAttachmentDialog } from "./dialogs/TaskAttachmentDialog";
import { FileUploadDialog } from "./dialogs/FileUploadDialog";
import { TaskActionButtons } from "./actions/TaskActionButtons";
import { TaskTemplatesDialog } from "./dialogs/TaskTemplatesDialog";
import { useTaskNotifications } from "@/hooks/useTaskNotifications";
import { useTaskAssignmentNotifications } from "@/hooks/useTaskAssignmentNotifications";
import { useAuthStore } from "@/store/authStore";
import { EditTaskDialog } from "../project-details/EditTaskDialog";
import type { Task as ProjectTask } from "../project-details/types/task";
import { handleTaskCompletion } from "./actions/handleTaskCompletion";
import { useTaskDependencies } from "../project-details/hooks/useTaskDependencies";
import { TaskDependenciesDialog } from "../project-details/components/dependencies/TaskDependenciesDialog";

interface TaskListItemProps {
  task: Task;
  onStatusChange: (taskId: string, status: string) => void;
  onDelete?: (taskId: string) => void;
  onTaskUpdated?: () => void;
}

export const TaskListItem = ({ task, onStatusChange, onDelete, onTaskUpdated }: TaskListItemProps) => {
  const [showDiscussion, setShowDiscussion] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAttachmentDialogOpen, setIsAttachmentDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isTemplatesDialogOpen, setIsTemplatesDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [showDependencies, setShowDependencies] = useState(false);
  const [hasNewDiscussion, setHasNewDiscussion] = useState(false);
  const [hasNewDeliverables, setHasNewDeliverables] = useState(false);
  const [hasTemplates, setHasTemplates] = useState(false);
  const currentStatus = task.status || "pending";
  const { sendTaskStatusUpdateNotification } = useTaskNotifications();
  const { sendTaskAssignmentNotification } = useTaskAssignmentNotifications();
  const { user } = useAuthStore();
  
  const { dependencies, dependentTasks, checkDependenciesCompleted } = useTaskDependencies(task.id);
  
  const hasDependencies = dependencies.length > 0;
  const hasDependents = dependentTasks.length > 0;
  const dependencyIconColor = hasDependencies && dependencies.some(d => d.status !== 'completed') 
    ? 'text-amber-500' 
    : hasDependencies || hasDependents 
      ? 'text-blue-500' 
      : 'text-gray-500';

  useEffect(() => {
    checkNewDiscussions();
    checkDeliverables();
    checkTemplates();
  }, [task.id]);

  const checkNewDiscussions = async () => {
    try {
      // Check last comment date vs user's last view date
      const { data: lastComments, error } = await supabase
        .from("unified_task_comments")
        .select("created_at")
        .eq("task_id", task.id)
        .order("created_at", { ascending: false })
        .limit(1);
        
      if (error) throw error;
      
      if (lastComments && lastComments.length > 0) {
        // Check if user has viewed this task's comments before
        const { data: viewRecord } = await supabase
          .from("task_comment_views")
          .select("last_viewed_at")
          .eq("task_id", task.id)
          .eq("user_id", user?.id)
          .single();
          
        const lastCommentDate = new Date(lastComments[0].created_at);
        const lastViewedDate = viewRecord ? new Date(viewRecord.last_viewed_at) : null;
        
        // If there's no view record or the last comment is newer than the last view
        if (!lastViewedDate || lastCommentDate > lastViewedDate) {
          setHasNewDiscussion(true);
        }
      }
    } catch (error) {
      console.error("Error checking for new discussions:", error);
    }
  };

  const checkDeliverables = async () => {
    try {
      if (task.assigned_to && task.assigned_to !== user?.id) {
        // Check for deliverables uploaded by assignee
        const { data: attachments, error } = await supabase
          .from("task_attachments")
          .select("created_at")
          .eq("task_id", task.id)
          .eq("created_by", task.assigned_to)
          .order("created_at", { ascending: false })
          .limit(1);
          
        if (error) throw error;
        
        if (attachments && attachments.length > 0) {
          // Check if user has viewed these attachments
          const { data: viewRecord } = await supabase
            .from("task_attachment_views")
            .select("last_viewed_at")
            .eq("task_id", task.id)
            .eq("user_id", user?.id)
            .single();
            
          const lastAttachmentDate = new Date(attachments[0].created_at);
          const lastViewedDate = viewRecord ? new Date(viewRecord.last_viewed_at) : null;
          
          if (!lastViewedDate || lastAttachmentDate > lastViewedDate) {
            setHasNewDeliverables(true);
          }
        }
      }
    } catch (error) {
      console.error("Error checking for new deliverables:", error);
    }
  };

  const checkTemplates = async () => {
    try {
      // Check if task has templates
      const { data: templates, error } = await supabase
        .from("task_templates")
        .select("id")
        .eq("task_id", task.id)
        .limit(1);
        
      if (error) throw error;
      
      if (templates && templates.length > 0) {
        setHasTemplates(true);
      }
    } catch (error) {
      console.error("Error checking for templates:", error);
    }
  };

  const handleStatusChange = async (status: string) => {
    setIsUpdating(true);
    try {
      if (status === 'completed' && currentStatus !== 'completed' && user?.id) {
        const taskTable = task.is_subtask ? 'subtasks' : 'tasks';
        await handleTaskCompletion({
          taskId: task.id,
          taskTable,
          userId: user.id,
          dueDate: task.due_date
        });
      }
      
      if (task.is_subtask) {
        const { error } = await supabase
          .from('subtasks')
          .update({ status })
          .eq('id', task.id);
          
        if (error) throw error;
        
        onStatusChange(task.id, status);
        toast.success('تم تحديث حالة المهمة الفرعية');
        
        if (task.assigned_to && task.assigned_to !== user?.id) {
          const userData = await supabase.auth.getUser(user?.id || '');
          const userName = userData.data?.user?.email || 'مستخدم';
          
          await sendTaskStatusUpdateNotification({
            taskId: task.id,
            taskTitle: task.title,
            assignedUserId: task.assigned_to,
            updatedByUserId: user?.id,
            updatedByUserName: userName
          }, status);
        }
      } else {
        onStatusChange(task.id, status);
        
        if (task.assigned_to && task.assigned_to !== user?.id) {
          const userData = await supabase.auth.getUser(user?.id || '');
          const userName = userData.data?.user?.email || 'مستخدم';
          
          await sendTaskStatusUpdateNotification({
            taskId: task.id,
            taskTitle: task.title,
            projectId: task.project_id,
            projectTitle: task.project_name,
            assignedUserId: task.assigned_to,
            updatedByUserId: user?.id,
            updatedByUserName: userName
          }, status);
        }
      }
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error('حدث خطأ أثناء تحديث حالة المهمة');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditTask = (taskId: string) => {
    setIsEditDialogOpen(true);
  };

  const handleTaskUpdated = () => {
    if (onTaskUpdated) {
      onTaskUpdated();
    }
  };

  const adaptTaskForEditDialog = (): ProjectTask => {
    return {
      ...task,
      description: task.description || null,
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
      <div className="flex justify-between items-start">
        <TaskHeader 
          task={task} 
          status={currentStatus} 
          onShowDependencies={() => setShowDependencies(true)}
          hasDependencies={hasDependencies || hasDependents}
          dependencyIconColor={dependencyIconColor}
        />
      </div>
      
      <div className="mt-3">
        <TaskMetadata
          dueDate={task.due_date}
          projectName={task.project_name}
          isSubtask={!!task.parent_task_id}
          parentTaskId={task.parent_task_id}
          isGeneral={task.is_general}
        />
      </div>
      
      <TaskActionButtons 
        currentStatus={currentStatus}
        isUpdating={isUpdating}
        onShowDiscussion={() => setShowDiscussion(true)}
        onOpenFileUploader={() => setIsUploadDialogOpen(true)}
        onOpenAttachments={() => setIsAttachmentDialogOpen(true)}
        onOpenTemplates={() => setIsTemplatesDialogOpen(true)}
        onStatusChange={handleStatusChange}
        onDelete={onDelete}
        onEdit={handleEditTask}
        taskId={task.id}
        isGeneral={task.is_general}
        hasNewDiscussion={hasNewDiscussion}
        hasNewDeliverables={hasNewDeliverables}
        hasTemplates={hasTemplates}
      />
      
      <TaskDiscussionDialog 
        open={showDiscussion} 
        onOpenChange={(open) => {
          setShowDiscussion(open);
          // Mark discussions as viewed when dialog is opened
          if (open && hasNewDiscussion) {
            setHasNewDiscussion(false);
            // Record the view in database
            if (user?.id) {
              supabase
                .from("task_comment_views")
                .upsert({
                  task_id: task.id,
                  user_id: user.id,
                  last_viewed_at: new Date().toISOString()
                })
                .then();
            }
          }
        }}
        task={task}
        onStatusChange={onStatusChange}
      />
      
      <TaskDependenciesDialog
        open={showDependencies}
        onOpenChange={setShowDependencies}
        task={task}
        projectId={task.project_id || ''}
      />
      
      {task && (
        <TaskAttachmentDialog
          task={task}
          open={isAttachmentDialogOpen}
          onOpenChange={(open) => {
            setIsAttachmentDialogOpen(open);
            // Mark deliverables as viewed when dialog is opened
            if (open && hasNewDeliverables) {
              setHasNewDeliverables(false);
              // Record the view in database
              if (user?.id) {
                supabase
                  .from("task_attachment_views")
                  .upsert({
                    task_id: task.id,
                    user_id: user.id,
                    last_viewed_at: new Date().toISOString()
                  })
                  .then();
              }
            }
          }}
        />
      )}
      
      {task && (
        <FileUploadDialog
          isOpen={isUploadDialogOpen}
          onClose={() => setIsUploadDialogOpen(false)}
          task={task}
        />
      )}

      {task && (
        <TaskTemplatesDialog
          task={task}
          open={isTemplatesDialogOpen}
          onOpenChange={setIsTemplatesDialogOpen}
        />
      )}

      {task && task.is_general && (
        <EditTaskDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          task={adaptTaskForEditDialog()}
          projectStages={[]}
          projectMembers={[]}
          onTaskUpdated={handleTaskUpdated}
        />
      )}
    </div>
  );
};
