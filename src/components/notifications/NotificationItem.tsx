
import React from 'react';
import { Notification } from '@/contexts/notifications/types';
import { cn } from '@/lib/utils';
import { useNotificationItem } from './hooks/useNotificationItem';
import { getNotificationIcon, formatNotificationDate } from './utils/notificationUtils';

interface NotificationItemProps {
  notification: Notification;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
  const { handleNotificationClick } = useNotificationItem(notification);
  
  const formattedDate = formatNotificationDate(notification.created_at);
  
  return (
    <div 
      className={cn(
        "flex items-start p-3 gap-3 cursor-pointer hover:bg-muted/50 transition-colors",
        !notification.read && "bg-blue-50 dark:bg-blue-950/20"
      )}
      onClick={handleNotificationClick}
      data-testid="notification-item"
    >
      <div className="rounded-full bg-muted p-2 flex-shrink-0">
        {getNotificationIcon(notification.notification_type)}
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
