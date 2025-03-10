
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { useDeveloperStore } from '@/store/developerStore';
import { useUserSettingsStore } from '@/store/userSettingsStore';
import { Code, Loader2, BugPlay, Gauge, Database } from 'lucide-react';
import { useAuthStore } from '@/store/refactored-auth';
import { isDeveloperModeEnabled, toggleDeveloperMode } from '@/utils/developerRole';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { checkDeveloperPermissions } from '@/components/users/permissions/utils/developerPermissionUtils';

export const DeveloperToolbar = () => {
  const { user } = useAuthStore();
  const { settings: userSettings, fetchSettings } = useUserSettingsStore();
  const [isDevModeEnabled, setIsDevModeEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [permissions, setPermissions] = useState({
    canAccessDeveloperTools: false,
    canModifySystemSettings: false,
    canAccessApiLogs: false,
    canManageDeveloperSettings: false,
    canViewPerformanceMetrics: false
  });

  useEffect(() => {
    const checkDevMode = async () => {
      if (!user) {
        setIsDevModeEnabled(false);
        setIsLoading(false);
        return;
      }

      try {
        // Load user settings
        if (!userSettings) {
          await fetchSettings(user.id);
        }
        
        // Check developer mode and permissions
        const enabled = await isDeveloperModeEnabled(user.id);
        setIsDevModeEnabled(enabled);
        
        // Load developer permissions
        const devPermissions = await checkDeveloperPermissions(user.id);
        setPermissions(devPermissions);
      } catch (error) {
        console.error('Error checking developer mode:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkDevMode();
  }, [user, userSettings, fetchSettings]);

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

  const handleClearCache = () => {
    localStorage.removeItem('tanstack-query-cache');
    sessionStorage.clear();
    window.location.reload();
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

  // الظهور الشرطي للشريط بناءً على الصلاحيات
  if (!user || !permissions.canAccessDeveloperTools) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={isDevModeEnabled ? "default" : "outline"}
            size="sm"
            className="gap-2"
          >
            <Code className="h-4 w-4" />
            {isDevModeEnabled ? 'وضع المطور مفعل' : 'وضع المطور معطل'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>أدوات المطور</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleToggleDevMode}>
            <Code className="h-4 w-4 mr-2" />
            {isDevModeEnabled ? 'تعطيل وضع المطور' : 'تفعيل وضع المطور'}
          </DropdownMenuItem>
          
          {permissions.canAccessApiLogs && (
            <DropdownMenuItem onClick={() => window.open('/developer/logs', '_blank')}>
              <BugPlay className="h-4 w-4 mr-2" />
              سجلات API
            </DropdownMenuItem>
          )}
          
          {permissions.canViewPerformanceMetrics && (
            <DropdownMenuItem onClick={() => window.open('/developer/performance', '_blank')}>
              <Gauge className="h-4 w-4 mr-2" />
              مقاييس الأداء
            </DropdownMenuItem>
          )}
          
          {permissions.canManageDeveloperSettings && (
            <DropdownMenuItem onClick={() => window.open('/developer/settings', '_blank')}>
              <Code className="h-4 w-4 mr-2" />
              إعدادات المطور
            </DropdownMenuItem>
          )}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleClearCache}>
            <Database className="h-4 w-4 mr-2" />
            مسح ذاكرة التخزين المؤقت
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
