
export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  notification_type: string;
  related_entity_id?: string;
  related_entity_type?: string;
  created_at: string;
}

export type NotificationType = 'all' | 'event' | 'project' | 'task' | 'user' | 'comment';
export type NotificationSort = 'newest' | 'oldest' | 'unread';

export interface NotificationContextProps {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  filterType: NotificationType;
  setFilterType: (type: NotificationType) => void;
  sortBy: NotificationSort;
  setSortBy: (sort: NotificationSort) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showUnreadOnly: boolean;
  setShowUnreadOnly: (show: boolean) => void;
}
