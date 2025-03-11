
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Code, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/refactored-auth';
import { isDeveloperModeEnabled, toggleDeveloperMode } from '@/utils/developer/modeManagement';
import { isDeveloper } from '@/utils/developer/roleManagement';

export const DeveloperToolbar = () => {
  const { user } = useAuthStore();
  const [isDevModeEnabled, setIsDevModeEnabled] = useState(false);
  const [isDeveloperUser, setIsDeveloperUser] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkDevMode = async () => {
      if (!user) {
        setIsDevModeEnabled(false);
        setIsDeveloperUser(false);
        setIsLoading(false);
        return;
      }

      try {
        // Check if user has developer role first
        const hasDeveloperRole = await isDeveloper(user.id);
        setIsDeveloperUser(hasDeveloperRole);
        
        if (hasDeveloperRole) {
          // If user has developer role, check if dev mode is enabled
          const enabled = await isDeveloperModeEnabled(user.id);
          setIsDevModeEnabled(enabled);
        } else {
          setIsDevModeEnabled(false);
        }
      } catch (error) {
        console.error('Error checking developer mode:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkDevMode();
  }, [user]);

  const handleToggleDevMode = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const success = await toggleDeveloperMode(user.id, !isDevModeEnabled);
      if (success) {
        setIsDevModeEnabled(!isDevModeEnabled);
      }
    } catch (error) {
      console.error('Error toggling developer mode:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <Button variant="outline" size="sm" disabled>
          <Loader2 className="h-4 w-4 animate-spin ml-2" />
          جارٍ التحميل...
        </Button>
      </div>
    );
  }

  // Only show toolbar if user is a developer
  if (!isDeveloperUser) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <Button
        variant={isDevModeEnabled ? "default" : "outline"}
        size="sm"
        onClick={handleToggleDevMode}
        className="gap-2"
      >
        <Code className="h-4 w-4" />
        {isDevModeEnabled ? 'وضع المطور مفعل' : 'وضع المطور معطل'}
      </Button>
    </div>
  );
};
