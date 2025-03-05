
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Notification, useNotifications } from '@/contexts/NotificationContext';
import { Bell, Calendar, FileText, PieChart, Users, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface NotificationItemProps {
  notification: Notification;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
  const { markAsRead } = useNotifications();
  const navigate = useNavigate();
  
  const getIcon = () => {
    switch (notification.notification_type) {
      case 'event':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'project':
        return <PieChart className="h-5 w-5 text-green-500" />;
      case 'task':
        return <FileText className="h-5 w-5 text-orange-500" />;
      case 'user':
        return <Users className="h-5 w-5 text-purple-500" />;
      case 'comment':
        return <MessageCircle className="h-5 w-5 text-pink-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const handleClick = () => {
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
        case 'task':
          navigate(`/tasks/${notification.related_entity_id}`);
          break;
        default:
          // Just mark as read, no navigation
          break;
      }
    }
  };
  
  const formattedDate = format(new Date(notification.created_at), 'dd MMM yyyy، HH:mm', { locale: ar });
  
  return (
    <div 
      className={cn(
        "flex items-start p-3 gap-3 cursor-pointer hover:bg-muted/50 transition-colors",
        !notification.read && "bg-blue-50 dark:bg-blue-950/20"
      )}
      onClick={handleClick}
    >
      <div className="rounded-full bg-muted p-2 flex-shrink-0">
        {getIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <h4 className={cn("text-sm font-medium", !notification.read && "font-semibold")}>
            {notification.title}
          </h4>
          {!notification.read && (
            <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-1"></span>
          )}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {formattedDate}
        </p>
      </div>
    </div>
  );
};
