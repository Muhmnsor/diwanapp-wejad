
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useInAppNotifications } from "@/contexts/notifications/useInAppNotifications";

interface TaskAssignmentNotificationProps {
  taskId: string;
  taskTitle: string;
  projectId?: string | null;
  projectTitle?: string | null;
  assignedUserId: string;
  assignedByUserId: string;
  assignedByUserName: string;
}

interface TaskStatusUpdateNotificationProps {
  taskId: string;
  taskTitle: string;
  projectId?: string | null;
  projectTitle?: string | null;
  assignedUserId: string;
  updatedByUserId?: string;
  updatedByUserName: string;
}

export const useTaskAssignmentNotifications = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { createNotification } = useInAppNotifications();

  const sendTaskAssignmentNotification = async ({
    taskId,
    taskTitle,
    projectId,
    projectTitle,
    assignedUserId,
    assignedByUserId,
    assignedByUserName
  }: TaskAssignmentNotificationProps) => {
    // Don't notify if the user assigned to themselves
    if (assignedUserId === assignedByUserId) return;

    setIsLoading(true);
    try {
      // Create in-app notification
      await createNotification({
        user_id: assignedUserId,
        title: "تم تعيين مهمة جديدة",
        message: projectTitle 
          ? `تم تعيينك إلى "${taskTitle}" في ${projectTitle} بواسطة ${assignedByUserName}`
          : `تم تعيينك إلى "${taskTitle}" بواسطة ${assignedByUserName}`,
        notification_type: "task_assignment",
        related_entity_id: taskId,
        related_entity_type: "task"
      });

      return true;
    } catch (error) {
      console.error("Error sending task assignment notification:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const sendTaskStatusUpdateNotification = async (
    {
      taskId,
      taskTitle,
      projectId,
      projectTitle,
      assignedUserId,
      updatedByUserId,
      updatedByUserName
    }: TaskStatusUpdateNotificationProps,
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
    sendTaskAssignmentNotification,
    sendTaskStatusUpdateNotification
  };
};
