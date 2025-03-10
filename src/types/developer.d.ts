
export interface DeveloperSettings {
  id: string;
  user_id: string;
  is_enabled: boolean;
  cache_time_minutes: number;
  update_interval_seconds: number;
  debug_level: 'info' | 'debug' | 'warn' | 'error';
  realtime_enabled: boolean;
  show_toolbar: boolean;
  created_at: string;
  updated_at: string;
}

export interface DeveloperStore {
  settings: DeveloperSettings | null;
  isLoading: boolean;
  error: Error | null;
  fetchSettings: () => Promise<void>;
  updateSettings: (settings: Partial<DeveloperSettings>) => Promise<void>;
  toggleDevMode: () => Promise<void>;
}
