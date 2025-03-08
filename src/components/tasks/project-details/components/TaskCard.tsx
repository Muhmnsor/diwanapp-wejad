
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Users, Check, Clock, ChevronDown, ChevronUp, MessageCircle, Paperclip, Link2, FileDown } from "lucide-react";
import { Task } from "../types/task";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { SubtasksList } from "./subtasks/SubtasksList";
import { checkPendingSubtasks } from "../services/subtasksService";
import { TaskDiscussionDialog } from "../../components/TaskDiscussionDialog";
import { TaskAttachmentDialog } from "../../components/dialogs/TaskAttachmentDialog";
import { TaskDependencyBadge } from "./dependencies/TaskDependencyBadge";
import { useTaskDependencies } from "../hooks/useTaskDependencies";
import { TaskDependenciesDialog } from "./dependencies/TaskDependenciesDialog";
import { usePermissionCheck } from "../hooks/usePermissionCheck";
import { supabase } from "@/integrations/supabase/client";

interface TaskCardProps {
  task: Task;
  getStatusBadge: (status: string) => JSX.Element;
  getPriorityBadge: (priority: string | null) => JSX.Element | null;
  formatDate: (date: string | null) => string;
  onStatusChange: (taskId: string, newStatus: string) => void;
  projectId: string;
}

export const TaskCard = ({ 
  task, 
  getStatusBadge, 
  getPriorityBadge, 
  formatDate,
  onStatusChange,
  projectId
}: TaskCardProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [showDiscussion, setShowDiscussion] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [showDependencies, setShowDependencies] = useState(false);
  const [hasNewDiscussion, setHasNewDiscussion] = useState(false);
  const [hasNewDeliverables, setHasNewDeliverables] = useState(false);
  const [hasTemplates, setHasTemplates] = useState(false);
  const { user } = useAuthStore();
  
  // Use the enhanced permission check hook
  const { canEdit } = usePermissionCheck({
    assignedTo: task.assigned_to,
    projectId: task.project_id,
    workspaceId: task.workspace_id,
    createdBy: task.created_by,
    isGeneral: task.is_general
  });
  
  const { dependencies, dependentTasks, checkDependenciesCompleted } = useTaskDependencies(task.id);
  
  const completedDependenciesCount = dependencies.filter(dep => dep.status === 'completed').length;
  const completedDependentsCount = dependentTasks.filter(dep => dep.status === 'completed').length;

  useEffect(() => {
    checkNewDiscussions();
    checkDeliverables();
    checkTemplates();
    
    // Set up real-time subscriptions for comments, deliverables, and templates
    const commentsChannel = supabase
      .channel('card-comments-' + task.id)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public', 
          table: 'unified_task_comments',
          filter: `task_id=eq.${task.id}`
        },
        (payload) => {
          if (!showDiscussion && user?.id) {
            setHasNewDiscussion(true);
          }
        }
      )
      .subscribe();
    
    const deliverablesChannel = supabase
      .channel('card-deliverables-' + task.id)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'task_deliverables',
          filter: `task_id=eq.${task.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            if (payload.new && payload.new.created_by === task.assigned_to && user?.id !== task.assigned_to) {
              setHasNewDeliverables(true);
            }
          } else if (payload.eventType === 'DELETE') {
            // If all deliverables deleted by assignee, remove notification
            if (payload.old && payload.old.created_by === task.assigned_to) {
              checkDeliverablesExist();
            }
          }
        }
      )
      .subscribe();
      
    const templatesChannel = supabase
      .channel('card-templates-' + task.id)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for all events
          schema: 'public',
          table: 'task_templates',
          filter: `task_id=eq.${task.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setHasTemplates(true);
          } else if (payload.eventType === 'DELETE') {
            // Check if any templates still exist
            checkTemplatesExist();
          }
        }
      )
      .subscribe();
      
    // Clean up subscriptions
    return () => {
      supabase.removeChannel(commentsChannel);
      supabase.removeChannel(deliverablesChannel);
      supabase.removeChannel(templatesChannel);
    };
  }, [task.id, task.assigned_to, showDiscussion, user?.id]);
  
  const checkDeliverablesExist = async () => {
    if (!task.id || !task.assigned_to || !user?.id || user.id === task.assigned_to) return;
    
    try {
      const { count, error } = await supabase
        .from("task_deliverables")
        .select("*", { count: 'exact', head: true })
        .eq("task_id", task.id)
        .eq("created_by", task.assigned_to);
        
      if (!error && count === 0) {
        setHasNewDeliverables(false);
      }
    } catch (error) {
      console.error("Error checking deliverables exist:", error);
    }
  };
  
  const checkTemplatesExist = async () => {
    if (!task.id) return;
    
    try {
      const { count, error } = await supabase
        .from("task_templates")
        .select("*", { count: 'exact', head: true })
        .eq("task_id", task.id);
        
      if (!error) {
        setHasTemplates(count > 0);
      }
    } catch (error) {
      console.error("Error checking templates exist:", error);
    }
  };

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
      
      if (lastComments && lastComments.length > 0 && user?.id) {
        // Check if user has viewed this task's comments before
        const { data: viewRecord } = await supabase
          .from("task_comment_views")
          .select("last_viewed_at")
          .eq("task_id", task.id)
          .eq("user_id", user.id)
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
        
        if (attachments && attachments.length > 0 && user?.id) {
          // Check if user has viewed these attachments
          const { data: viewRecord } = await supabase
            .from("task_attachment_views")
            .select("last_viewed_at")
            .eq("task_id", task.id)
            .eq("user_id", user.id)
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
      }
      
      await onStatusChange(task.id, newStatus);
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error("حدث خطأ أثناء تحديث حالة المهمة");
    } finally {
      setIsUpdating(false);
    }
  };

  const markDiscussionsAsViewed = () => {
    if (user?.id && hasNewDiscussion) {
      setHasNewDiscussion(false);
      // Record the view in database
      supabase
        .from("task_comment_views")
        .upsert({
          task_id: task.id,
          user_id: user.id,
          last_viewed_at: new Date().toISOString()
        })
        .then();
    }
  };

  const markAttachmentsAsViewed = () => {
    if (user?.id && hasNewDeliverables) {
      setHasNewDeliverables(false);
      // Record the view in database
      supabase
        .from("task_attachment_views")
        .upsert({
          task_id: task.id,
          user_id: user.id,
          last_viewed_at: new Date().toISOString()
        })
        .then();
    }
  };

  return (
    <Card className="border hover:border-primary/50 transition-colors">
      <CardContent className="p-4 text-right">
        <div className="flex justify-between items-start mb-2">
          <div className="flex gap-2">
            {getStatusBadge(task.status)}
            {getPriorityBadge(task.priority)}
          </div>
          <div className="flex items-center cursor-pointer" onClick={() => setShowSubtasks(!showSubtasks)}>
            <h3 className="font-semibold text-lg">{task.title}</h3>
            {showSubtasks ? 
              <ChevronUp className="h-4 w-4 text-gray-500 mr-1" /> : 
              <ChevronDown className="h-4 w-4 text-gray-500 mr-1" />
            }
          </div>
        </div>
        
        {task.description && (
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{task.description}</p>
        )}
        
        <div className="flex flex-col gap-2 items-end">
          {task.assigned_user_name && (
            <div className="flex items-center text-sm">
              <span className="mr-1">{task.assigned_user_name}</span>
              <Users className="h-3.5 w-3.5 mr-1 text-gray-500" />
            </div>
          )}
          
          {task.due_date && (
            <div className="flex items-center text-sm">
              <span className="mr-1">{formatDate(task.due_date)}</span>
              <Calendar className="h-3.5 w-3.5 mr-1 text-gray-500" />
            </div>
          )}
          
          {task.stage_name && (
            <Badge variant="outline" className="font-normal text-xs">
              {task.stage_name}
            </Badge>
          )}
          
          <div className="flex gap-2 mt-1">
            {(dependencies.length > 0 || dependentTasks.length > 0) && (
              <div 
                className="cursor-pointer" 
                onClick={() => setShowDependencies(true)}
              >
                {dependencies.length > 0 && (
                  <TaskDependencyBadge 
                    count={dependencies.length} 
                    completedCount={completedDependenciesCount} 
                    type="dependencies"
                  />
                )}
                
                {dependentTasks.length > 0 && (
                  <TaskDependencyBadge 
                    count={dependentTasks.length} 
                    completedCount={completedDependentsCount} 
                    type="dependents" 
                  />
                )}
              </div>
            )}
          </div>

          <div className="mt-3 flex justify-end gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`text-xs flex items-center gap-1 ${hasNewDeliverables 
                ? "text-blue-600 hover:text-blue-800 font-medium" 
                : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => {
                setShowAttachments(true);
                markAttachmentsAsViewed();
              }}
            >
              <Paperclip className={`h-3.5 w-3.5 ${hasNewDeliverables ? "text-blue-600" : ""}`} />
              {hasNewDeliverables ? "مرفقات جديدة" : "المرفقات"}
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className={`text-xs flex items-center gap-1 ${hasNewDiscussion 
                ? "text-purple-600 hover:text-purple-800 font-medium" 
                : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => {
                setShowDiscussion(true);
                markDiscussionsAsViewed();
              }}
            >
              <MessageCircle className={`h-3.5 w-3.5 ${hasNewDiscussion ? "text-purple-600" : ""}`} />
              {hasNewDiscussion ? "مناقشة جديدة" : "مناقشة"}
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className={`text-xs flex items-center gap-1 ${hasTemplates 
                ? "text-orange-500 hover:text-orange-700 font-medium" 
                : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => setShowDependencies(true)}
            >
              <Link2 className={`h-3.5 w-3.5 ${hasTemplates ? "text-orange-500" : ""}`} />
              {hasTemplates ? "نماذج متاحة" : "الاعتماديات"}
            </Button>

            {canEdit && (
              task.status !== 'completed' ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 px-3"
                  onClick={() => handleStatusUpdate('completed')}
                  disabled={isUpdating}
                >
                  <Check className="h-3.5 w-3.5 text-green-500 ml-1" />
                  إكمال المهمة
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 px-3"
                  onClick={() => handleStatusUpdate('in_progress')}
                  disabled={isUpdating}
                >
                  <Clock className="h-3.5 w-3.5 text-amber-500 ml-1" />
                  إعادة فتح المهمة
                </Button>
              )
            )}
          </div>
          
          {showSubtasks && (
            <div className="w-full mt-3">
              <SubtasksList 
                taskId={task.id}
                projectId={projectId}
              />
            </div>
          )}
        </div>
      </CardContent>

      <TaskDiscussionDialog 
        open={showDiscussion} 
        onOpenChange={(open) => {
          setShowDiscussion(open);
          if (open) {
            markDiscussionsAsViewed();
          }
        }}
        task={task}
      />
      
      <TaskAttachmentDialog
        task={task}
        open={showAttachments}
        onOpenChange={(open) => {
          setShowAttachments(open);
          if (open) {
            markAttachmentsAsViewed();
          }
        }}
      />
      
      <TaskDependenciesDialog
        open={showDependencies}
        onOpenChange={setShowDependencies}
        task={task}
        projectId={projectId}
      />
    </Card>
  );
};
