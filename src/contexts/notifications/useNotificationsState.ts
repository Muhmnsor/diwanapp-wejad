import { useState, useMemo, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { Notification, NotificationType, NotificationSort } from './types';

export const useNotificationsState = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<NotificationType>('all');
  const [sortBy, setSortBy] = useState<NotificationSort>('newest');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showUnreadOnly, setShowUnreadOnly] = useState<boolean>(false);
  const { user, isAuthenticated } = useAuthStore();
  
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated || !user) {
      console.log('لم يتم تسجيل الدخول أو لا يوجد مستخدم، تخطي الجلب');
      setLoading(false);
      return;
    }
    
    try {
      console.log('جلب الإشعارات للمستخدم:', user.id);
      setLoading(true);
      const { data, error } = await supabase
        .from('in_app_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('خطأ في جلب الإشعارات:', error);
        throw error;
      }
      
      console.log('تم جلب الإشعارات:', data?.length || 0, 'الإشعارات غير المقروءة:', data?.filter(n => !n.read).length || 0);
      setNotifications(data || []);
    } catch (error) {
      console.error('خطأ في جلب الإشعارات:', error);
      toast.error('حدث خطأ أثناء تحميل الإشعارات');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const markAsRead = async (id: string) => {
    if (!user) return;
    
    try {
      console.log('تعليم الإشعار كمقروء:', id);
      const { error } = await supabase
        .from('in_app_notifications')
        .update({ read: true })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, read: true } 
            : notification
        )
      );
      
      console.log('تم تعليم الإشعار كمقروء بنجاح');
      return true;
    } catch (error) {
      console.error('خطأ في تعليم الإشعار كمقروء:', error);
      toast.error('حدث خطأ أثناء تحديث الإشعار');
      return false;
    }
  };

  const markAllAsRead = async () => {
    if (!user || unreadCount === 0) return;
    
    try {
      const { error } = await supabase
        .from('in_app_notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;
      
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      
      toast.success('تم تحديث جميع الإشعارات كمقروءة');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('حدث خطأ أثناء تحديث الإشعارات');
    }
  };

  const deleteReadNotifications = async () => {
    if (!user) return;
    
    try {
      console.log('حذف الإشعارات المقروءة للمستخدم:', user.id);
      
      const { error } = await supabase
        .from('in_app_notifications')
        .delete()
        .eq('user_id', user.id)
        .eq('read', true);

      if (error) throw error;
      
      setNotifications(prev => prev.filter(notification => !notification.read));
      
      toast.success('تم حذف جميع الإشعارات المقروءة');
      return true;
    } catch (error) {
      console.error('خطأ في حذف الإشعارات المقروءة:', error);
      toast.error('حدث خطأ أثناء حذف الإشعارات المقروءة');
      return false;
    }
  };

  const filteredNotifications = useMemo(() => {
    console.log('تصفية الإشعارات:', {
      total: notifications.length,
      filter: filterType,
      searchQuery,
      showUnreadOnly
    });
    
    return notifications
      .filter(notification => {
        if (filterType !== 'all' && notification.notification_type !== filterType) {
          return false;
        }
        
        if (showUnreadOnly && notification.read) {
          return false;
        }
        
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            notification.title.toLowerCase().includes(query) || 
            notification.message.toLowerCase().includes(query)
          );
        }
        
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        } else if (sortBy === 'oldest') {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        } else if (sortBy === 'unread') {
          if (a.read !== b.read) {
            return a.read ? 1 : -1;
          }
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        
        return 0;
      });
  }, [notifications, filterType, sortBy, searchQuery, showUnreadOnly]);
  
  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      console.log('لم يتم تسجيل الدخول أو لا يوجد مستخدم، تخطي الاشتراك');
      return;
    }

    console.log('إعداد اشتراك الإشعارات للمستخدم:', user.id);
    
    fetchNotifications();

    const channelName = `notifications_${user.id}_${Date.now()}`;
    console.log('Creating realtime subscription channel:', channelName);
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'in_app_notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('تم استلام إشعار جديد:', payload);
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          
          toast.info(newNotification.title, {
            description: newNotification.message,
            duration: 5000,
          });
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
        if (status !== 'SUBSCRIBED') {
          console.warn('Failed to subscribe to realtime notifications, status:', status);
        }
      });

    const intervalId = setInterval(() => {
      console.log('Refreshing notifications (periodic)');
      fetchNotifications();
    }, 30000);

    return () => {
      console.log('إلغاء اشتراك الإشعارات');
      supabase.removeChannel(channel);
      clearInterval(intervalId);
    };
  }, [isAuthenticated, user, fetchNotifications]);

  return {
    notifications: filteredNotifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteReadNotifications,
    fetchNotifications,
    filterType,
    setFilterType,
    sortBy,
    setSortBy,
    searchQuery,
    setSearchQuery,
    showUnreadOnly,
    setShowUnreadOnly
  };
};
