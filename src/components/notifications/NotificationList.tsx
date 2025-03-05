
import React from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { NotificationItem } from './NotificationItem';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCheck, Filter } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const NotificationList: React.FC = () => {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAllAsRead, 
    filterType, 
    setFilterType,
    showUnreadOnly,
    setShowUnreadOnly
  } = useNotifications();
  
  const handleReadStatusChange = (value: string) => {
    setShowUnreadOnly(value === 'unread');
  };
  
  const displayedNotifications = showUnreadOnly 
    ? notifications.filter(n => !n.read) 
    : notifications;
  
  if (loading) {
    return (
      <div className="p-4 h-[200px] flex items-center justify-center">
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
        <div className="flex items-center gap-2">
          <Select value={filterType} onValueChange={(value) => setFilterType(value as any)}>
            <SelectTrigger className="h-7 text-xs w-28">
              <Filter className="h-3 w-3 ml-1" />
              <SelectValue placeholder="الكل" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              <SelectItem value="event">فعاليات</SelectItem>
              <SelectItem value="project">مشاريع</SelectItem>
              <SelectItem value="task">مهام</SelectItem>
              <SelectItem value="user">مستخدمين</SelectItem>
            </SelectContent>
          </Select>
          
          <Select 
            defaultValue="all" 
            onValueChange={handleReadStatusChange}
            value={showUnreadOnly ? 'unread' : 'all'}
          >
            <SelectTrigger className="h-7 text-xs w-28">
              <CheckCheck className="h-3 w-3 ml-1" />
              <SelectValue placeholder="جميع الإشعارات" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الإشعارات</SelectItem>
              <SelectItem value="unread">
                غير المقروءة {unreadCount > 0 && `(${unreadCount})`}
              </SelectItem>
            </SelectContent>
          </Select>
          
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-7 flex items-center" 
              onClick={markAllAsRead}
            >
              <CheckCheck className="h-3 w-3 ml-1" />
              تحديد الكل
            </Button>
          )}
        </div>
      </div>
      
      <ScrollArea className="h-[300px]">
        <div className="flex flex-col divide-y">
          {displayedNotifications.map((notification) => (
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

