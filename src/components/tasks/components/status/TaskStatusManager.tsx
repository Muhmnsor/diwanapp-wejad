
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { handleTaskCompletion } from "../actions/handleTaskCompletion";
import { useTaskNotifications } from "@/hooks/useTaskNotifications";
import { useAuthStore } from "@/store/authStore";

interface TaskStatusManagerProps {
  taskId: string;
  taskTitle: string;
  isSubtask: boolean;
  currentStatus: string;
  dueDate?: string | null;
  projectId?: string | null;
  projectName?: string | null;
  assignedTo?: string | null;
  onStatusChange: (taskId: string, status: string) => void;
}

export const useTaskStatusManager = ({
  taskId,
  taskTitle,
  isSubtask,
  currentStatus,
  dueDate,
  projectId,
  projectName,
  assignedTo,
  onStatusChange
}: TaskStatusManagerProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { sendTaskStatusUpdateNotification } = useTaskNotifications();
  const { user } = useAuthStore();
  
  const handleStatusChange = async (status: string) => {
    setIsUpdating(true);
    try {
      if (status === 'completed' && currentStatus !== 'completed' && user?.id) {
        const taskTable = isSubtask ? 'subtasks' : 'tasks';
        await handleTaskCompletion({
          taskId,
          taskTable,
          userId: user.id,
          dueDate
        });
      }
      
      if (isSubtask) {
        const { error } = await supabase
          .from('subtasks')
          .update({ status })
          .eq('id', taskId);
          
        if (error) throw error;
        
        onStatusChange(taskId, status);
        toast.success('تم تحديث حالة المهمة الفرعية');
        
        if (assignedTo && assignedTo !== user?.id) {
          const userData = await supabase.auth.getUser(user?.id || '');
          const userName = userData.data?.user?.email || 'مستخدم';
          
          await sendTaskStatusUpdateNotification({
            taskId,
            taskTitle,
            assignedUserId: assignedTo,
            updatedByUserId: user?.id,
            updatedByUserName: userName
          }, status);
        }
      } else {
        onStatusChange(taskId, status);
        
        if (assignedTo && assignedTo !== user?.id) {
          const userData = await supabase.auth.getUser(user?.id || '');
          const userName = userData.data?.user?.email || 'مستخدم';
          
          await sendTaskStatusUpdateNotification({
            taskId,
            taskTitle,
            projectId,
            projectTitle: projectName,
            assignedUserId: assignedTo,
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

  return {
    isUpdating,
    handleStatusChange
  };
};
