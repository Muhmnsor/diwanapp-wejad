import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Users, Check, Clock, ChevronDown, ChevronUp, MessageCircle, Paperclip, Link2 } from "lucide-react";
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
import { useTaskButtonStates } from "../../hooks/useTaskButtonStates";
import { DependencyIcon } from "../../components/dependencies/DependencyIcon";

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
  const { user } = useAuthStore();
  
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
  const hasPendingDependencies = dependencies.some(dep => dep.status !== 'completed');

  const { hasNewDiscussion, hasDeliverables, hasTemplates, resetDiscussionFlag } = useTaskButtonStates(task.id);

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

  const handleShowDiscussion = () => {
    resetDiscussionFlag();
    setShowDiscussion(true);
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
              variant={dependencies.length > 0 || dependentTasks.length > 0 ? "outline" : "ghost"}
              size="sm" 
              className={`text-xs flex items-center gap-1 ${
                hasPendingDependencies 
                  ? "border-amber-200 text-amber-600 hover:bg-amber-50" 
                  : (dependencies.length > 0 || dependentTasks.length > 0)
                    ? "border-blue-200 text-blue-600 hover:bg-blue-50"
                    : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setShowDependencies(true)}
            >
              <DependencyIcon 
                hasDependencies={dependencies.length > 0} 
                hasPendingDependencies={hasPendingDependencies}
                hasDependents={dependentTasks.length > 0}
                size={14}
              />
              الاعتماديات
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
        onOpenChange={setShowDiscussion}
        task={task}
      />
      
      <TaskAttachmentDialog
        task={task}
        open={showAttachments}
        onOpenChange={setShowAttachments}
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
