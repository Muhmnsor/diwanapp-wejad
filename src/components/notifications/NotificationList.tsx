
import React from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { NotificationItem } from './NotificationItem';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCheck, Filter } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const NotificationList: React.FC = () => {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAllAsRead, 
    filterType, 
    setFilterType 
  } = useNotifications();
  
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
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full grid grid-cols-2 h-8 text-xs">
          <TabsTrigger value="all">الكل</TabsTrigger>
          <TabsTrigger value="unread">
            غير المقروءة {unreadCount > 0 && `(${unreadCount})`}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-0">
          <ScrollArea className="h-[300px]">
            <div className="flex flex-col divide-y">
              {notifications.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="unread" className="mt-0">
          <ScrollArea className="h-[300px]">
            <div className="flex flex-col divide-y">
              {notifications.filter(n => !n.read).map((notification) => (
                <NotificationItem key={notification.id} notification={notification} />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
      
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
