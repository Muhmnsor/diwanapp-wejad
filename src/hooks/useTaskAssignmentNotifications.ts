
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TaskAssignmentParams {
  taskId: string;
  taskTitle: string;
  assigneeId: string;
  projectId?: string | null;
  projectTitle?: string | null;
  assignedByUserId?: string | null;
  assignedByUserName?: string | null;
}

export const useTaskAssignmentNotifications = () => {
  const sendTaskAssignmentNotification = useCallback(async (params: TaskAssignmentParams) => {
    try {
      const { taskId, taskTitle, assigneeId, projectId, projectTitle, assignedByUserId, assignedByUserName } = params;
      
      // Create in-app notification
      const { error } = await supabase
        .from('in_app_notifications')
        .insert({
          user_id: assigneeId,
          title: 'تم تكليفك بمهمة جديدة',
          message: `تم تكليفك بمهمة "${taskTitle}"${projectTitle ? ` في المشروع "${projectTitle}"` : ''}`,
          notification_type: 'task_assignment',
          related_entity_id: taskId,
          related_entity_type: 'task',
          initiator_id: assignedByUserId || null,
          meta: {
            project_id: projectId || null,
            assigned_by: assignedByUserName || null
          }
        });
      
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error('Error sending task assignment notification:', error);
      toast.error('حدث خطأ أثناء إرسال الإشعار');
      return { success: false, error };
    }
  }, []);

  // For compatibility with the existing TaskListItem component
  const notifyTaskAssignment = useCallback(async (taskId: string, taskTitle: string, assigneeId: string) => {
    return sendTaskAssignmentNotification({ taskId, taskTitle, assigneeId });
  }, [sendTaskAssignmentNotification]);

  return {
    sendTaskAssignmentNotification,
    notifyTaskAssignment
  };
};
