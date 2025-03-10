
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/refactored-auth";
import { useUserPermissions } from "./useUserPermissions";
import { AppItem } from "@/components/admin/dashboard/DashboardApps";
import * as Icons from "lucide-react";

interface AppSetting {
  app_key: string;
  app_name: string;
  description: string;
  icon: string;
  path: string;
  is_visible: boolean;
  requires_permission: boolean;
  permission_key: string | null;
  order_index: number;
}

export const useDashboardApps = (notificationCounts: any = {}) => {
  const { user } = useAuthStore();
  const { hasPermission, isLoading: permissionsLoading } = useUserPermissions();
  const [visibleApps, setVisibleApps] = useState<AppItem[]>([]);

  // Fetch app settings from database
  const { data: appSettings, isLoading: appsLoading } = useQuery({
    queryKey: ['app-settings'],
    queryFn: async (): Promise<AppSetting[]> => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .order('order_index');
        
      if (error) {
        console.error('Error fetching app settings:', error);
        throw error;
      }
      
      return data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Process visible apps based on permissions
  useEffect(() => {
    if (permissionsLoading || appsLoading || !appSettings) return;

    // Check if this is the specific user that should see all apps
    const isSpecificUser = user?.email === 'info@dfy.org.sa';
    
    if (isSpecificUser || user?.isAdmin) {
      // Show all apps for the specific user or admin
      const allApps = appSettings.map(app => {
        const notifCount = notificationCounts[app.app_key] || 0;
        const IconComponent = (Icons as any)[app.icon] || Icons.AppWindow;
        
        return {
          title: app.app_name,
          icon: IconComponent,
          path: app.path,
          description: app.description,
          notifications: notifCount
        };
      });
      
      setVisibleApps(allApps);
    } else {
      // Regular filtering logic for other users
      const filteredApps = appSettings
        .filter(app => {
          // If app is not visible, skip it
          if (!app.is_visible) return false;
          
          // If app doesn't require permission, show it
          if (!app.requires_permission) return true;
          
          // If no permission key specified, show it (fallback)
          if (!app.permission_key) return true;
          
          // Check if user has the required permission
          return hasPermission(app.permission_key);
        })
        .map(app => {
          // Get the notification count for this app (if any)
          const notifCount = notificationCounts[app.app_key] || 0;
          
          // Get the icon component from Lucide
          const IconComponent = (Icons as any)[app.icon] || Icons.AppWindow;
          
          return {
            title: app.app_name,
            icon: IconComponent,
            path: app.path,
            description: app.description,
            notifications: notifCount
          };
        });
        
      setVisibleApps(filteredApps);
    }
  }, [appSettings, permissionsLoading, appsLoading, hasPermission, user, notificationCounts]);

  return {
    apps: visibleApps,
    isLoading: permissionsLoading || appsLoading
  };
};
