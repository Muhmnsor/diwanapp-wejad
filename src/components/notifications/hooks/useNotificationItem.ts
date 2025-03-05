
import { useNotifications } from '@/contexts/NotificationContext';
import { Notification } from '@/contexts/notifications/types';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const useNotificationItem = (notification: Notification) => {
  const { markAsRead } = useNotifications();
  const [isMarking, setIsMarking] = useState(false);
  const navigate = useNavigate();

  const handleNotificationClick = async () => {
    // إذا كان الإشعار مقروءًا بالفعل، انتقل مباشرة إلى العنصر المرتبط
    if (notification.read) {
      console.log('الإشعار مقروء بالفعل، التنقل مباشرة', notification.id);
      navigateToRelatedEntity();
      return;
    }

    // وضع علامة على الإشعار كمقروء فقط إذا لم يكن مقروءًا بالفعل
    setIsMarking(true);
    try {
      console.log('وضع علامة على الإشعار كمقروء:', notification.id);
      const success = await markAsRead(notification.id);
      console.log('تم وضع علامة على الإشعار:', notification.id, 'نجاح:', success);
      navigateToRelatedEntity();
    } catch (error) {
      console.error('خطأ في وضع علامة على الإشعار كمقروء:', error);
    } finally {
      setIsMarking(false);
    }
  };

  const navigateToRelatedEntity = () => {
    if (!notification.related_entity_id || !notification.related_entity_type) {
      console.log('لا توجد معلومات تنقل للإشعار:', notification.id);
      return;
    }

    console.log('التنقل إلى الكيان المرتبط:', {
      type: notification.related_entity_type,
      id: notification.related_entity_id
    });

    // التنقل بناءً على نوع الكيان
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
        // للتعليقات، قد نحتاج إلى التنقل إلى الكيان الأصلي
        break;
      case 'system':
        // للإشعارات النظامية، قد لا نتنقل إلى أي مكان
        console.log('إشعار نظام، لا يوجد تنقل');
        break;
      default:
        console.log('لا يوجد إجراء تنقل للنوع:', notification.related_entity_type);
    }
  };

  return { handleNotificationClick, isMarking };
};
