
import { useNavigate } from 'react-router-dom';
import { Notification } from '@/contexts/notifications/types';
import { useNotifications } from '@/contexts/NotificationContext';

export const useNotificationItem = (notification: Notification) => {
  const { markAsRead } = useNotifications();
  const navigate = useNavigate();
  
  const handleNotificationClick = () => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // Navigate based on notification type and related entity
    if (notification.related_entity_id && notification.related_entity_type) {
      switch (notification.related_entity_type) {
        case 'event':
          navigate(`/events/${notification.related_entity_id}`);
          break;
        case 'project':
          navigate(`/projects/${notification.related_entity_id}`);
          break;
        case 'project_task':
        case 'task':
          navigate(`/tasks/${notification.related_entity_id}`);
          break;
        case 'idea':
          navigate(`/ideas/${notification.related_entity_id}`);
          break;
        case 'finance':
          navigate(`/finance`);
          break;
        default:
          // Just mark as read, no navigation
          break;
      }
    }
  };

  return {
    handleNotificationClick
  };
};
