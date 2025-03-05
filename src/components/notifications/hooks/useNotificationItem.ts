
import { useNotifications } from '@/contexts/NotificationContext';
import { Notification } from '@/contexts/notifications/types';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const useNotificationItem = (notification: Notification) => {
  const { markAsRead } = useNotifications();
  const [isMarking, setIsMarking] = useState(false);
  const navigate = useNavigate();

  const handleNotificationClick = async () => {
    if (notification.read) {
      navigateToRelatedEntity();
      return;
    }

    setIsMarking(true);
    try {
      await markAsRead(notification.id);
      console.log('Notification marked as read:', notification.id);
      navigateToRelatedEntity();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    } finally {
      setIsMarking(false);
    }
  };

  const navigateToRelatedEntity = () => {
    if (!notification.related_entity_id || !notification.related_entity_type) {
      return;
    }

    console.log('Navigating to related entity:', {
      type: notification.related_entity_type,
      id: notification.related_entity_id
    });

    // Navigate based on entity type
    switch (notification.related_entity_type) {
      case 'event':
        navigate(`/events/${notification.related_entity_id}`);
        break;
      case 'project':
        navigate(`/projects/${notification.related_entity_id}`);
        break;
      case 'task':
        navigate(`/tasks`);
        break;
      case 'user':
        navigate(`/profile/${notification.related_entity_id}`);
        break;
      case 'comment':
        // For comments, we might need to navigate to the parent entity
        break;
      default:
        console.log('No navigation action for type:', notification.related_entity_type);
    }
  };

  return { handleNotificationClick, isMarking };
};
