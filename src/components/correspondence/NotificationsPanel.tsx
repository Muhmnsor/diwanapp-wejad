import React, { useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Bell, X, Check, AlarmClock, Clock, MailOpen, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

export const NotificationsPanel = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // وظيفة جلب الإشعارات
  const fetchNotifications = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) return;
      
      const { data, error } = await supabase
        .from('in_app_notifications')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false })
        .limit(30);
      
      if (error) throw error;
      
      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.read).length || 0);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  // وظيفة تحديث حالة قراءة الإشعار
  const markAsRead = async (id) => {
    try {
      const { error } = await supabase
        .from('in_app_notifications')
        .update({ read: true })
        .eq('id', id);
      
      if (error) throw error;
      
      // تحديث القائمة المحلية
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // وظيفة تحديث حالة قراءة جميع الإشعارات
  const markAllAsRead = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) return;
      
      const { error } = await supabase
        .from('in_app_notifications')
        .update({ read: true })
        .eq('user_id', user.user.id)
        .eq('read', false);
      
      if (error) throw error;
      
      // تحديث القائمة المحلية
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
      setUnreadCount(0);
      
      toast({
        title: "تم تحديث الإشعارات",
        description: "تم تعيين جميع الإشعارات كمقروءة",
      });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // وظيفة الانتقال للمعاملة المرتبطة بالإشعار
  const navigateToCorrespondence = (id, notificationId) => {
    markAsRead(notificationId);
    setOpen(false);
    navigate(`/admin/correspondence/${id}`);
  };

  // وظيفة تحديد أيقونة الإشعار حسب النوع
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_correspondence':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'response':
        return <MailOpen className="h-4 w-4 text-green-500" />;
      case 'deadline_reminder':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'deadline_overdue':
        return <AlarmClock className="h-4 w-4 text-red-500" />;
      case 'assignment':
        return <FileText className="h-4 w-4 text-purple-500" />;
      case 'completion':
        return <Check className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  // الاستماع لتغييرات الإشعارات
  useEffect(() => {
    fetchNotifications();
    
    // إعداد الاشتراك في الوقت الفعلي لإشعارات جديدة
    const subscription = supabase
      .channel('notifications_channel')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'in_app_notifications' 
      }, payload => {
        fetchNotifications();
      })
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" onClick={() => fetchNotifications()}>
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 min-w-[1.25rem] flex items-center justify-center">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0" dir="rtl">
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-semibold">الإشعارات</h3>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead} title="تعيين الكل كمقروء">
                <Check className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <ScrollArea className="h-[400px] p-0">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              لا توجد إشعارات حالياً
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`p-3 flex gap-3 hover:bg-muted/50 cursor-pointer relative ${
                    !notif.read ? 'bg-muted/30' : ''
                  }`}
                  onClick={() => notif.related_entity_type === 'correspondence' ? 
                    navigateToCorrespondence(notif.related_entity_id, notif.id) : 
                    markAsRead(notif.id)
                  }
                >
                  <div className="mt-1">
                    {getNotificationIcon(notif.notification_type)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{notif.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">{notif.message}</div>
                    <div className="text-[0.65rem] text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: ar })}
                    </div>
                  </div>
                  {!notif.read && (
                    <div 
                      className="absolute top-3 right-3" 
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notif.id);
                      }}
                    >
                      <Button size="icon" variant="ghost" className="h-5 w-5">
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  {notif.priority === 'high' && (
                    <div className="absolute left-3 top-3">
                      <span className="w-2 h-2 bg-red-500 rounded-full block"></span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsPanel;
