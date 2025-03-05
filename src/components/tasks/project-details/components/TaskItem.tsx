import { Calendar, Users, Check, Clock, AlertCircle, ChevronDown, ChevronUp, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TableRow, TableCell } from "@/components/ui/table";
import { Task } from "../types/task";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { SubtasksList } from "./subtasks/SubtasksList";
import { checkPendingSubtasks } from "../services/subtasksService";
import { TaskDiscussionDialog } from "../../components/TaskDiscussionDialog";

interface TaskItemProps {
  task: Task;
  getStatusBadge: (status: string) => JSX.Element;
  getPriorityBadge: (priority: string | null) => JSX.Element | null;
  formatDate: (date: string | null) => string;
  onStatusChange: (taskId: string, newStatus: string) => void;
  projectId: string;
}

export const TaskItem = ({ 
  task, 
  getStatusBadge, 
  getPriorityBadge, 
  formatDate,
  onStatusChange,
  projectId
}: TaskItemProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [showDiscussion, setShowDiscussion] = useState(false);
  const { user } = useAuthStore();
  
  const canChangeStatus = () => {
    return (
      user?.id === task.assigned_to || 
      user?.isAdmin || 
      user?.role === 'admin'
    );
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!canChangeStatus()) {
      toast.error("لا يمكنك تغيير حالة المهمة لأنك لست المكلف بها");
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

  const renderStatusChangeButton = () => {
    if (!canChangeStatus()) {
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
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-0 h-7 w-7"
            onClick={(e) => {
              e.stopPropagation();
              setShowDiscussion(true);
            }}
            title="مناقشة المهمة"
          >
            <MessageCircle className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </Button>
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
      />
    </>
  );
};
