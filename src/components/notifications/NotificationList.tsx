
import React from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { NotificationItem } from './NotificationItem';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCheck } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export const NotificationList: React.FC = () => {
  const { notifications, unreadCount, loading, markAllAsRead } = useNotifications();
  
  if (loading) {
    return (
      <div className="p-4 h-[300px] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="mr-2">جاري تحميل الإشعارات...</span>
      </div>
    );
  }
  
  if (!notifications.length) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <p>لا توجد إشعارات</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col" dir="rtl">
      <div className="p-2 border-b flex items-center justify-between bg-muted/50">
        <h3 className="font-medium text-sm">الإشعارات</h3>
        {unreadCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs flex items-center" 
            onClick={markAllAsRead}
          >
            <CheckCheck className="h-3.5 w-3.5 ml-1" />
            تحديد الكل كمقروء
          </Button>
        )}
      </div>
      
      <ScrollArea className="h-[350px]">
        <div className="flex flex-col divide-y">
          {notifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))}
        </div>
      </ScrollArea>
      
      <div className="p-2 border-t">
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full text-xs"
          asChild
        >
          <a href="/notifications">عرض كل الإشعارات</a>
        </Button>
      </div>
    </div>
  );
};
