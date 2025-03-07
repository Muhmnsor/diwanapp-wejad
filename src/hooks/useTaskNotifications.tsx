
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useInAppNotifications } from "@/contexts/notifications/useInAppNotifications";

interface TaskUpdateProps {
  taskId: string;
  taskTitle: string;
  projectId?: string | null;
  projectTitle?: string | null;
  assignedUserId: string;
  updatedByUserId?: string;
  updatedByUserName: string;
}

export const useTaskNotifications = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { createNotification } = useInAppNotifications();

  const sendTaskStatusUpdateNotification = async (
    {
      taskId,
      taskTitle,
      projectId,
      projectTitle,
      assignedUserId,
      updatedByUserId,
      updatedByUserName
    }: TaskUpdateProps,
    newStatus: string
  ) => {
    // Don't notify if the user updated their own task
    if (assignedUserId === updatedByUserId) return;

    setIsLoading(true);
    try {
      // Get status label in Arabic
      const statusLabel = getStatusLabel(newStatus);

      // Create in-app notification
      await createNotification({
        user_id: assignedUserId,
        title: "تم تحديث حالة المهمة",
        message: projectTitle 
          ? `تم تحديث حالة "${taskTitle}" في ${projectTitle} إلى "${statusLabel}" بواسطة ${updatedByUserName}`
          : `تم تحديث حالة "${taskTitle}" إلى "${statusLabel}" بواسطة ${updatedByUserName}`,
        notification_type: "task_update",
        related_entity_id: taskId,
        related_entity_type: "task"
      });

      return true;
    } catch (error) {
      console.error("Error sending task status update notification:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const sendDependencyCompletionNotification = async ({
    taskId,
    taskTitle,
    dependencyTaskId,
    dependencyTaskTitle,
    assignedUserId,
    completedByUserName
  }: {
    taskId: string;
    taskTitle: string;
    dependencyTaskId: string;
    dependencyTaskTitle: string;
    assignedUserId: string;
    completedByUserName: string;
  }) => {
    setIsLoading(true);
    try {
      // Create in-app notification
      await createNotification({
        user_id: assignedUserId,
        title: "تم اكتمال مهمة معتمدة",
        message: `تم اكتمال المهمة "${dependencyTaskTitle}" التي تعتمد عليها مهمتك "${taskTitle}" بواسطة ${completedByUserName}`,
        notification_type: "task_dependency",
        related_entity_id: taskId,
        related_entity_type: "task"
      });

      return true;
    } catch (error) {
      console.error("Error sending dependency completion notification:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'مكتملة';
      case 'in_progress':
        return 'قيد التنفيذ';
      case 'pending':
        return 'قيد الانتظار';
      case 'delayed':
        return 'متأخرة';
      case 'cancelled':
        return 'ملغاة';
      default:
        return status;
    }
  };

  return {
    isLoading,
    sendTaskStatusUpdateNotification,
    sendDependencyCompletionNotification
  };
};
