
import React, { useEffect } from 'react';
import { TopHeader } from '@/components/layout/TopHeader';
import { Footer } from '@/components/layout/Footer';
import { useNotifications, NotificationType, NotificationSort } from '@/contexts/NotificationContext';
import { NotificationItem } from './NotificationItem';
import { Button } from '@/components/ui/button';
import { CheckCheck, Loader2, Search, Filter, SortDesc } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const NotificationPage: React.FC = () => {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAllAsRead, 
    fetchNotifications,
    filterType,
    setFilterType,
    sortBy,
    setSortBy,
    searchQuery,
    setSearchQuery,
    showUnreadOnly,
    setShowUnreadOnly
  } = useNotifications();
  
  useEffect(() => {
    // Refresh notifications when this page loads
    fetchNotifications();
  }, [fetchNotifications]);
  
  const handleFilterChange = (value: string) => {
    setFilterType(value as NotificationType);
  };
  
  const handleSortChange = (value: string) => {
    setSortBy(value as NotificationSort);
  };

  const handleReadStatusChange = (value: string) => {
    setShowUnreadOnly(value === 'unread');
  };
  
  const displayedNotifications = showUnreadOnly 
    ? notifications.filter(n => !n.read) 
    : notifications;
  
  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <TopHeader />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">الإشعارات</h1>
          {unreadCount > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={markAllAsRead}
              className="flex items-center"
            >
              <CheckCheck className="h-4 w-4 ml-2" />
              تحديد الكل كمقروء
            </Button>
          )}
        </div>
        
        <div className="space-y-4">
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="البحث في الإشعارات..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-8"
                  />
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  <div className="w-40">
                    <Select value={filterType} onValueChange={handleFilterChange}>
                      <SelectTrigger>
                        <Filter className="h-4 w-4 ml-2" />
                        <SelectValue placeholder="تصفية حسب" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">الكل</SelectItem>
                        <SelectItem value="event">فعاليات</SelectItem>
                        <SelectItem value="project">مشاريع</SelectItem>
                        <SelectItem value="task">مهام</SelectItem>
                        <SelectItem value="user">مستخدمين</SelectItem>
                        <SelectItem value="comment">تعليقات</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="w-40">
                    <Select value={sortBy} onValueChange={handleSortChange}>
                      <SelectTrigger>
                        <SortDesc className="h-4 w-4 ml-2" />
                        <SelectValue placeholder="ترتيب حسب" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">الأحدث</SelectItem>
                        <SelectItem value="oldest">الأقدم</SelectItem>
                        <SelectItem value="unread">غير المقروءة</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="w-40">
                    <Select defaultValue="all" onValueChange={handleReadStatusChange}>
                      <SelectTrigger>
                        <CheckCheck className="h-4 w-4 ml-2" />
                        <SelectValue placeholder="حالة القراءة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">جميع الإشعارات</SelectItem>
                        <SelectItem value="unread">غير المقروءة {unreadCount > 0 && `(${unreadCount})`}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>
                {showUnreadOnly ? 'الإشعارات غير المقروءة' : 'جميع الإشعارات'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderNotificationContent(loading, displayedNotifications, showUnreadOnly)}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

function renderNotificationContent(loading: boolean, notifications: any[], unreadOnly: boolean) {
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="mr-3">جاري تحميل الإشعارات...</span>
      </div>
    );
  }
  
  if (notifications.length > 0) {
    return (
      <div className="flex flex-col divide-y">
        {notifications.map((notification) => (
          <NotificationItem key={notification.id} notification={notification} />
        ))}
      </div>
    );
  }
  
  return (
    <div className="text-center py-12 text-muted-foreground">
      <p>{unreadOnly ? 'لا توجد إشعارات غير مقروءة' : 'لا توجد إشعارات'}</p>
    </div>
  );
}

