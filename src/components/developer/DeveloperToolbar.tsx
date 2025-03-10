
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { useDeveloperStore } from '@/store/developerStore';
import { useUserSettingsStore } from '@/store/userSettingsStore';
import { 
  Code, 
  Loader2, 
  BugPlay, 
  Gauge, 
  Database, 
  RefreshCw,
  Monitor,
  BarChart,
  LayoutDashboard,
  AlertCircle
} from 'lucide-react';
import { useAuthStore } from '@/store/refactored-auth';
import { isDeveloperModeEnabled, toggleDeveloperMode } from '@/utils/developerRole';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { checkDeveloperPermissions } from '@/components/users/permissions/utils/developerPermissionUtils';
import { clearQueryCache } from '@/utils/queryCache';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { performanceMonitor } from '@/utils/performanceMonitor';
import { toast } from 'sonner';

export const DeveloperToolbar = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { settings: userSettings, fetchSettings } = useUserSettingsStore();
  const { settings: devSettings, fetchSettings: fetchDevSettings } = useDeveloperStore();
  
  const [isDevModeEnabled, setIsDevModeEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [permissions, setPermissions] = useState({
    canAccessDeveloperTools: false,
    canModifySystemSettings: false,
    canAccessApiLogs: false,
    canManageDeveloperSettings: false,
    canViewPerformanceMetrics: false
  });
  const [isPerformanceMonitoringEnabled, setIsPerformanceMonitoringEnabled] = useState(false);
  const [currentRoute, setCurrentRoute] = useState('');

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
        
        // Load developer settings
        if (!devSettings) {
          await fetchDevSettings();
        }
        
        // Check developer mode and permissions
        const enabled = await isDeveloperModeEnabled(user.id);
        setIsDevModeEnabled(enabled);
        
        // Load developer permissions
        const devPermissions = await checkDeveloperPermissions(user.id);
        setPermissions(devPermissions);
        
        // Check if performance monitoring is enabled
        try {
          const events = performanceMonitor.getEvents();
          setIsPerformanceMonitoringEnabled(events.length > 0);
        } catch (e) {
          setIsPerformanceMonitoringEnabled(false);
        }
        
        // Set current route
        setCurrentRoute(window.location.pathname);
      } catch (error) {
        console.error('Error checking developer mode:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkDevMode();
  }, [user, userSettings, devSettings, fetchSettings, fetchDevSettings]);

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
    clearQueryCache(queryClient);
    localStorage.removeItem('tanstack-query-cache');
    sessionStorage.clear();
    toast.success('تم مسح الذاكرة المؤقتة');
  };
  
  const handleNavigateTo = (path: string) => {
    navigate(path);
  };
  
  const handleTogglePerformanceMonitoring = () => {
    if (isPerformanceMonitoringEnabled) {
      performanceMonitor.disable();
      setIsPerformanceMonitoringEnabled(false);
      toast.success('تم إيقاف مراقبة الأداء');
    } else {
      performanceMonitor.enable(true);
      setIsPerformanceMonitoringEnabled(true);
      toast.success('تم تفعيل مراقبة الأداء');
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

  // الظهور الشرطي للشريط بناءً على الصلاحيات
  if (!user || !permissions.canAccessDeveloperTools) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2">
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
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>أدوات المطور</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={handleToggleDevMode}>
              <Code className="h-4 w-4 mr-2" />
              {isDevModeEnabled ? 'تعطيل وضع المطور' : 'تفعيل وضع المطور'}
            </DropdownMenuItem>
            
            {permissions.canManageDeveloperSettings && (
              <DropdownMenuItem onClick={() => handleNavigateTo('/developer/settings')}>
                <LayoutDashboard className="h-4 w-4 mr-2" />
                لوحة المطور
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuGroup>
            <DropdownMenuLabel>أدوات المراقبة</DropdownMenuLabel>
            
            {permissions.canViewPerformanceMetrics && (
              <>
                <DropdownMenuItem onClick={() => handleNavigateTo('/developer/performance')}>
                  <BarChart className="h-4 w-4 mr-2" />
                  مقاييس الأداء
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={handleTogglePerformanceMonitoring}>
                  <Monitor className="h-4 w-4 mr-2" />
                  {isPerformanceMonitoringEnabled ? 'إيقاف مراقبة الأداء' : 'تفعيل مراقبة الأداء'}
                </DropdownMenuItem>
              </>
            )}
            
            {permissions.canAccessApiLogs && (
              <DropdownMenuItem onClick={() => handleNavigateTo('/developer/logs')}>
                <BugPlay className="h-4 w-4 mr-2" />
                سجلات API
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuGroup>
            <DropdownMenuLabel>أدوات التصحيح</DropdownMenuLabel>
            
            <DropdownMenuItem onClick={handleClearCache}>
              <Database className="h-4 w-4 mr-2" />
              مسح ذاكرة التخزين المؤقت
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => {
              console.log('User:', user);
              console.log('Developer permissions:', permissions);
              console.log('Current route:', currentRoute);
              console.log('Query cache:', queryClient.getQueryCache().getAll());
              toast.success('تم طباعة معلومات التصحيح في وحدة التحكم');
            }}>
              <AlertCircle className="h-4 w-4 mr-2" />
              طباعة معلومات التصحيح
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              إعادة تحميل الصفحة
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {isDevModeEnabled && permissions.canViewPerformanceMetrics && isPerformanceMonitoringEnabled && (
        <div className="bg-black bg-opacity-80 text-white text-xs p-2 rounded shadow">
          <div className="flex items-center justify-between mb-1">
            <span>FCP:</span>
            <span>
              {(performanceMonitor.getEvents().find(e => e.name === 'first-contentful-paint')?.startTime || 0).toFixed(0)} ms
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Load:</span>
            <span>
              {(performanceMonitor.getEvents().find(e => e.name === 'page-load')?.duration || 0).toFixed(0)} ms
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
