
import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';
import { NotificationType, NotificationSort, Notification } from './types';
import { toast } from 'sonner';

export const useNotificationsState = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<NotificationType>('all');
  const [sortBy, setSortBy] = useState<NotificationSort>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const { user } = useAuthStore();

  // Count unread notifications
  useEffect(() => {
    const count = notifications.filter(n => !n.read).length;
    setUnreadCount(count);
  }, [notifications]);

  // Fetch notifications based on current filters
  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching notifications for user:', user.id);
      console.log('Filter:', { type: filterType, sortBy, showUnreadOnly, searchQuery });
      
      let query = supabase
        .from('in_app_notifications')
        .select('*')
        .eq('user_id', user.id);
      
      // Apply type filter
      if (filterType !== 'all') {
        query = query.eq('notification_type', filterType);
      }
      
      // Apply read status filter
      if (showUnreadOnly) {
        query = query.eq('read', false);
      }
      
      // Apply search query
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,message.ilike.%${searchQuery}%`);
      }
      
      // Apply sorting
      query = query.order('created_at', { ascending: sortBy === 'oldest' });
      
      // Execute query
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching notifications:', error);
        throw error;
      }
      
      console.log('Retrieved notifications:', data?.length || 0);
      setNotifications(data || []);
    } catch (error) {
      console.error('Error in fetchNotifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user, filterType, sortBy, showUnreadOnly, searchQuery]);

  // Mark single notification as read
  const markAsRead = async (notificationId: string) => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('in_app_notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error marking notification as read:', error);
        return false;
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      
      return true;
    } catch (error) {
      console.error('Error in markAsRead:', error);
      return false;
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('in_app_notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        toast.error('حدث خطأ أثناء تحديث الإشعارات');
        return;
      }
      
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('تم تحديث جميع الإشعارات كمقروءة');
    } catch (error) {
      console.error('Error in markAllAsRead:', error);
      toast.error('حدث خطأ أثناء تحديث الإشعارات');
    }
  };

  // Delete a single notification
  const deleteNotification = async (notificationId: string) => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('in_app_notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting notification:', error);
        toast.error('حدث خطأ أثناء حذف الإشعار');
        return false;
      }
      
      // Update local state
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      toast.success('تم حذف الإشعار بنجاح');
      return true;
    } catch (error) {
      console.error('Error in deleteNotification:', error);
      toast.error('حدث خطأ أثناء حذف الإشعار');
      return false;
    }
  };

  // Delete read notifications
  const deleteReadNotifications = async () => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('in_app_notifications')
        .delete()
        .eq('user_id', user.id)
        .eq('read', true);

      if (error) {
        console.error('Error deleting read notifications:', error);
        toast.error('حدث خطأ أثناء حذف الإشعارات المقروءة');
        return false;
      }
      
      // Update local state
      setNotifications(prev => prev.filter(n => !n.read));
      toast.success('تم حذف الإشعارات المقروءة بنجاح');
      return true;
    } catch (error) {
      console.error('Error in deleteReadNotifications:', error);
      toast.error('حدث خطأ أثناء حذف الإشعارات المقروءة');
      return false;
    }
  };

  // Initial fetch on mount and auth changes
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
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
