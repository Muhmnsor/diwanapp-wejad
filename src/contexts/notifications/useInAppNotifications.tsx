
import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type NotificationType = 'task_assignment' | 'task_update' | 'task_mention' | 'task_comment' | 'task_dependency' | 'workspace_invitation' | 'project_invitation';

interface Notification {
  id: string;
  title: string;
  message: string;
  user_id: string;
  notification_type: NotificationType;
  related_entity_id?: string;
  related_entity_type?: string;
  read: boolean;
  created_at: string;
}

interface NotificationInput {
  user_id: string;
  title: string;
  message: string;
  notification_type: NotificationType;
  related_entity_id?: string;
  related_entity_type?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  createNotification: (notification: NotificationInput) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }
      
      const { data, error: fetchError } = await supabase
        .from('in_app_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
        
      if (fetchError) throw fetchError;
      
      setNotifications(data || []);
      
      // Count unread notifications
      const unread = (data || []).filter(notification => !notification.read).length;
      setUnreadCount(unread);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const markAsRead = async (notificationId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('in_app_notifications')
        .update({ read: true })
        .eq('id', notificationId);
        
      if (updateError) throw updateError;
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true } 
            : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
    }
  };
  
  const markAllAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;
      
      const { error: updateError } = await supabase
        .from('in_app_notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);
        
      if (updateError) throw updateError;
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      
      // Update unread count
      setUnreadCount(0);
    } catch (err: any) {
      console.error('Error marking all notifications as read:', err);
    }
  };
  
  const createNotification = async (notification: NotificationInput) => {
    try {
      const { error: insertError } = await supabase
        .from('in_app_notifications')
        .insert([notification]);
        
      if (insertError) throw insertError;
      
      // No need to update local state as we'll receive the update via subscription
    } catch (err: any) {
      console.error('Error creating notification:', err);
    }
  };
  
  // Set up real-time notifications
  useEffect(() => {
    const setupRealtimeNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;
      
      const channel = supabase
        .channel('in-app-notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'in_app_notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            const newNotification = payload.new as Notification;
            
            // Update notifications list
            setNotifications(prev => [newNotification, ...prev]);
            
            // Update unread count
            if (!newNotification.read) {
              setUnreadCount(prev => prev + 1);
            }
            
            // Show toast for new notification
            toast(newNotification.title, {
              description: newNotification.message,
              action: {
                label: "عرض",
                onClick: () => markAsRead(newNotification.id)
              }
            });
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    };
    
    const cleanup = setupRealtimeNotifications();
    
    return () => {
      cleanup.then(fn => fn && fn());
    };
  }, []);

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        error,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        createNotification
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useInAppNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useInAppNotifications must be used within a NotificationProvider');
  }
  return context;
}
