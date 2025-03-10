
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/refactored-auth';
import { isDeveloper } from '@/utils/developerRole';

interface DeveloperSettingsHook {
  isDeveloperMode: boolean;
  isLoading: boolean;
  error: Error | null;
}

export const useDeveloperSettings = (): DeveloperSettingsHook => {
  const { user } = useAuthStore();
  const [isDeveloperMode, setIsDeveloperMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const checkDevMode = async () => {
      if (!user) {
        setIsDeveloperMode(false);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const hasDeveloperRole = await isDeveloper(user.id);
        setIsDeveloperMode(hasDeveloperRole);
        setError(null);
      } catch (err) {
        console.error('Error checking developer mode:', err);
        setError(err instanceof Error ? err : new Error('Unknown error checking developer mode'));
        setIsDeveloperMode(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkDevMode();
  }, [user]);

  return { isDeveloperMode, isLoading, error };
};
