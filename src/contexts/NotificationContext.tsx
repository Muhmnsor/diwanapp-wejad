
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNotificationsState } from './notifications/useNotificationsState';
import { NotificationContextProps } from './notifications/types';
import { useAuthStore } from '@/store/authStore';

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    console.warn('useNotifications was called outside of NotificationProvider');
    // Return a fallback empty state to prevent crashes
    return {
      notifications: [],
      unreadCount: 0,
      loading: false,
      markAsRead: async () => false,
      markAllAsRead: async () => {},
      fetchNotifications: async () => {},
      filterType: 'all',
      setFilterType: () => {},
      sortBy: 'newest',
      setSortBy: () => {},
      searchQuery: '',
      setSearchQuery: () => {},
      showUnreadOnly: false,
      setShowUnreadOnly: () => {}
    };
  }
  return context;
};

export type { 
  Notification, 
  NotificationType, 
  NotificationSort 
} from './notifications/types';

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuthStore();
  const [initialized, setInitialized] = useState(false);
  
  // Only initialize the notifications state when we know the authentication status
  useEffect(() => {
    if (isAuthenticated !== undefined) {
      setInitialized(true);
    }
  }, [isAuthenticated]);
  
  // If we're not authenticated or not initialized, render without notifications
  if (!initialized || !isAuthenticated) {
    return <>{children}</>;
  }
  
  // Only initialize the notifications state when authenticated
  // This prevents hooks from being called conditionally
  try {
    const notificationsState = useNotificationsState();
    
    return (
      <NotificationContext.Provider value={notificationsState}>
        {children}
      </NotificationContext.Provider>
    );
  } catch (error) {
    console.error('Error initializing NotificationProvider:', error);
    return <>{children}</>;
  }
};
