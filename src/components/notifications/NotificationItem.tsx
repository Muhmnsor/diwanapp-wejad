
import React from 'react';
import { Notification } from '@/contexts/notifications/types';
import { cn } from '@/lib/utils';
import { useNotificationItem } from './hooks/useNotificationItem';
import { getNotificationIcon, formatNotificationDate } from './utils/notificationUtils';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useNotifications } from '@/contexts/NotificationContext';

interface NotificationItemProps {
  notification: Notification;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
  const { handleNotificationClick } = useNotificationItem(notification);
  const { deleteNotification, markAsRead } = useNotifications();
  
  const formattedDate = formatNotificationDate(notification.created_at);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNotification(notification.id);
  };
  
  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };
  
  return (
    <div 
      className={cn(
        "flex items-start p-3 gap-3 cursor-pointer hover:bg-muted/50 transition-colors relative group",
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
      
      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <span className="sr-only">خيارات</span>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                <path d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM12.5 8.625C13.1213 8.625 13.625 8.12132 13.625 7.5C13.625 6.87868 13.1213 6.375 12.5 6.375C11.8787 6.375 11.375 6.87868 11.375 7.5C11.375 8.12132 11.8787 8.625 12.5 8.625Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
              </svg>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {!notification.read && (
              <DropdownMenuItem onClick={handleMarkAsRead}>
                تحديد كمقروء
              </DropdownMenuItem>
            )}
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive" 
              onClick={handleDelete}
            >
              حذف
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
