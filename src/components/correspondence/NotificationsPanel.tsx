import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Bell, Clock, AlertTriangle, CheckCircle, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  type: string;
  read: boolean;
  correspondence_id?: string;
  distribution_id?: string;
  deadline_date?: string;
}

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({
  isOpen,
  onClose,
  userId
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");

  useEffect(() => {
    if (isOpen && userId) {
      fetchNotifications();
    }
  }, [isOpen, userId]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('in_app_notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setNotifications(data || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('in_app_notifications')
        .update({ read: true })
        .eq('id', notificationId);
        
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId ? { ...notification, read: true } : notification
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await supabase
        .from('in_app_notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);
        
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const getFilteredNotifications = () => {
    switch (activeTab) {
      case 'unread':
        return notifications.filter(n => !n.read);
      case 'deadlines':
        return notifications.filter(n => n.type === 'deadline');
      case 'distribution':
        return notifications.filter(n => n.type === 'distribution');
      case 'updates':
        return notifications.filter(n => n.type === 'update');
      default:
        return notifications;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('ar-SA');
    } catch (error) {
      return dateString;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'deadline':
        return <Calendar className="h-5 w-5 text-yellow-500" />;
      case 'distribution':
        return <Bell className="h-5 w-5 text-blue-500" />;
      case 'update':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const notificationTitle = (type: string) => {
    switch (type) {
      case 'deadline':
        return 'موعد نهائي';
      case 'distribution':
        return 'توزيع معاملة';
      case 'update':
        return 'تحديث معاملة';
      default:
        return 'إشعار';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            الإشعارات
          </DialogTitle>
          <DialogDescription>
            عرض الإشعارات والمواعيد النهائية المتعلقة بالمعاملات
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="all">الكل</TabsTrigger>
              <TabsTrigger value="unread">غير المقروءة</TabsTrigger>
              <TabsTrigger value="deadlines">المواعيد النهائية</TabsTrigger>
              <TabsTrigger value="distribution">توزيع</TabsTrigger>
              <TabsTrigger value="updates">تحديثات</TabsTrigger>
            </TabsList>
            
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              تعيين الكل كمقروءة
            </Button>
          </div>
          
          <TabsContent value={activeTab} className="min-h-[300px]">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : getFilteredNotifications().length > 0 ? (
              <div className="space-y-3">
                {getFilteredNotifications().map(notification => (
                  <div 
                    key={notification.id} 
                    className={`p-4 border rounded-lg ${notification.read ? 'bg-white' : 'bg-blue-50'}`}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-full">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{notification.title}</h4>
                            <Badge variant="outline">
                              {notificationTitle(notification.type)}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(notification.created_at)}
                          </span>
                        </div>
                        <p className="mt-1 text-sm">{notification.message}</p>
                        {notification.deadline_date && (
                          <div className="mt-2 flex items-center text-sm text-yellow-600">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>موعد نهائي: {formatDate(notification.deadline_date)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {!notification.read && (
                      <div className="flex justify-end mt-2">
                        <Badge className="bg-blue-100 text-blue-800">جديد</Badge>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">لا توجد إشعارات</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  ستظهر الإشعارات الجديدة والمواعيد النهائية هنا
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>إغلاق</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

