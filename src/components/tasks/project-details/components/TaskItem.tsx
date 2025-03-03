
import { Calendar, Users, Check, Clock, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TableRow, TableCell } from "@/components/ui/table";
import { Task } from "../TasksList";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";

interface TaskItemProps {
  task: Task;
  getStatusBadge: (status: string) => JSX.Element;
  getPriorityBadge: (priority: string | null) => JSX.Element | null;
  formatDate: (date: string | null) => string;
  onStatusChange: (taskId: string, newStatus: string) => void;
}

export const TaskItem = ({ 
  task, 
  getStatusBadge, 
  getPriorityBadge, 
  formatDate,
  onStatusChange
}: TaskItemProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { user } = useAuthStore();
  
  const canChangeStatus = () => {
    // Allow status change if:
    // 1. User is assigned to the task
    // 2. User is an admin
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
        className="h-7 px-2 ml-2"
        onClick={() => handleStatusUpdate('completed')}
        disabled={isUpdating}
      >
        <Check className="h-3.5 w-3.5 text-green-500 mr-1" />
        إكمال
      </Button>
    ) : (
      <Button 
        variant="outline" 
        size="sm" 
        className="h-7 px-2 ml-2"
        onClick={() => handleStatusUpdate('in_progress')}
        disabled={isUpdating}
      >
        <Clock className="h-3.5 w-3.5 text-amber-500 mr-1" />
        قيد التنفيذ
      </Button>
    );
  };

  return (
    <TableRow key={task.id}>
      <TableCell className="font-medium">{task.title}</TableCell>
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
    </TableRow>
  );
};
