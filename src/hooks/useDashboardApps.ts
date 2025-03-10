
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

    // TEMPORARY FIX: Show all apps regardless of permissions until properly configured
    const filteredApps = appSettings
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
    
    /* Original filtering logic - COMMENTED OUT FOR NOW
    const filteredApps = appSettings
      // Filter visible apps and those the user has permission for
      .filter(app => {
        // If app is not visible, skip it
        if (!app.is_visible) return false;
        
        // If app doesn't require permission, show it
        if (!app.requires_permission) return true;
        
        // If no permission key specified, show it (fallback)
        if (!app.permission_key) return true;
        
        // Admin users can see all apps
        if (user?.isAdmin) return true;
        
        // Check if user has the required permission
        return hasPermission(app.permission_key);
      })
      // Map to AppItem format for DashboardApps component
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
    */
  }, [appSettings, permissionsLoading, appsLoading, hasPermission, user, notificationCounts]);

  return {
    apps: visibleApps,
    isLoading: permissionsLoading || appsLoading
  };
};
