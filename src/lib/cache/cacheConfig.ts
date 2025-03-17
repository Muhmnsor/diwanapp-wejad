
import { useEffect } from 'react';
import { useDeveloperStore } from "@/store/developerStore";

export type DataCategory = 'static' | 'semi-static' | 'dynamic' | 'sensitive';

interface CacheSettings {
  staleTime: number; // milliseconds
  gcTime: number; // milliseconds
  refetchOnWindowFocus: boolean;
  refetchOnMount: boolean | 'always' | false;
  refetchOnReconnect: boolean;
  refetchInterval: number | false; // milliseconds or false
}

export const DEFAULT_CACHE_SETTINGS: Record<DataCategory, CacheSettings> = {
  static: {
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    gcTime: 7 * 24 * 60 * 60 * 1000, // 7 days
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  },
  'semi-static': {
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchInterval: false,
  },
  dynamic: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: 'always',
    refetchOnReconnect: true,
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  },
  sensitive: {
    staleTime: 0, // No caching
    gcTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: true,
    refetchOnMount: 'always',
    refetchOnReconnect: true,
    refetchInterval: false,
  },
};

export const getCacheSettings = (
  category: DataCategory,
  devSettings?: { 
    cache_time_minutes?: number; 
    update_interval_seconds?: number;
    is_enabled?: boolean;
  }
): CacheSettings => {
  // Start with the default settings for the category
  const settings = { ...DEFAULT_CACHE_SETTINGS[category] };

  // If developer settings are provided and dev mode is enabled, override defaults
  if (devSettings && devSettings.is_enabled) {
    if (category !== 'sensitive') { // Don't override sensitive data settings
      if (devSettings.cache_time_minutes) {
        settings.staleTime = devSettings.cache_time_minutes * 60 * 1000;
        settings.gcTime = settings.staleTime * 2;
      }
      
      if (devSettings.update_interval_seconds) {
        settings.refetchInterval = 
          category === 'dynamic' ? devSettings.update_interval_seconds * 1000 : false;
      }
    }
  }

  return settings;
};

// A hook to detect and store online/offline status
export const useNetworkStatus = () => {
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  
  useEffect(() => {
    // Implementation of online/offline detection
    const handleOnline = () => {
      console.log('Smart Cache: Network is online');
      // Here you could implement sync of any cached updates made while offline
    };
    
    const handleOffline = () => {
      console.log('Smart Cache: Network is offline');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return { isOnline };
};
