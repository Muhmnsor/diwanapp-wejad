
import React, { createContext, useContext } from 'react';
import { useNotificationsState } from './notifications/useNotificationsState';
import { NotificationContextProps } from './notifications/types';

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export type { 
  Notification, 
  NotificationType, 
  NotificationSort 
} from './notifications/types';

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const notificationsState = useNotificationsState();

  return (
    <NotificationContext.Provider value={notificationsState}>
      {children}
    </NotificationContext.Provider>
  );
};
