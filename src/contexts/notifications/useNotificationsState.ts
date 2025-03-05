
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
      console.log('Not authenticated or no user, skipping fetch');
      setLoading(false);
      return;
    }
    
    try {
      console.log('Fetching notifications for user:', user.id);
      setLoading(true);
      const { data, error } = await supabase
        .from('in_app_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching notifications:', error);
        throw error;
      }
      
      console.log('Fetched notifications:', data?.length || 0);
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('حدث خطأ أثناء تحميل الإشعارات');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const markAsRead = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('in_app_notifications')
        .update({ read: true })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, read: true } 
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('حدث خطأ أثناء تحديث الإشعار');
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
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      
      toast.success('تم تحديث جميع الإشعارات كمقروءة');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('حدث خطأ أثناء تحديث الإشعارات');
    }
  };

  // Filter, sort and search notifications
  const filteredNotifications = useMemo(() => {
    console.log('Filtering notifications:', {
      total: notifications.length,
      filter: filterType,
      searchQuery
    });
    
    return notifications
      .filter(notification => {
        // Filter by type
        if (filterType !== 'all' && notification.notification_type !== filterType) {
          return false;
        }
        
        // Search in title and message
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
        // Sort by selected method
        if (sortBy === 'newest') {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        } else if (sortBy === 'oldest') {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        } else if (sortBy === 'unread') {
          // Sort unread first, then by date
          if (a.read !== b.read) {
            return a.read ? 1 : -1;
          }
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        
        return 0;
      });
  }, [notifications, filterType, sortBy, searchQuery]);
  
  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!isAuthenticated || !user) {
      console.log('Not authenticated or no user, skipping subscription');
      return;
    }

    console.log('Setting up notification subscription for user:', user.id);
    
    // Initial fetch
    fetchNotifications();

    // Subscribe to new notifications
    const channel = supabase
      .channel('in_app_notification_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'in_app_notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Received new notification:', payload);
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          
          // Show toast for new notification
          toast.info(newNotification.title, {
            description: newNotification.message,
            duration: 5000,
          });
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up notification subscription');
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated, user, fetchNotifications]);

  return {
    notifications: filteredNotifications,
    unreadCount,
    loading,
    markAsRead,
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
  };
};
