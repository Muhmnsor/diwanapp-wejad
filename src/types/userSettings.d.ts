
export interface UserSettings {
  id: string;
  user_id: string;
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications_enabled: boolean;
  email_notifications: boolean;
  cache_duration_minutes: number;
  developer_mode: boolean;
  realtime_updates: boolean;
  created_at: string;
  updated_at: string;
}
