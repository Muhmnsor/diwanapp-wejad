
import { 
  Database, 
  ListChecks, 
  Lightbulb, 
  DollarSign, 
  Globe, 
  ShoppingCart, 
  Users, 
  Bell,
  Clock,
  Inbox,
  Code
} from "lucide-react";
import { AppItem } from "./DashboardApps";
import { NotificationCounts } from "@/hooks/dashboard/useNotificationCounts";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const useAppPermissions = (userId: string | undefined) => {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!userId) {
        setPermissions([]);
        setLoading(false);
        return;
      }

      try {
        // First get user's role
        const { data: userRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select('role_id')
          .eq('user_id', userId);

        if (rolesError) throw rolesError;
        
        if (!userRoles || userRoles.length === 0) {
          setPermissions([]);
          setLoading(false);
          return;
        }

        // Get all permissions for these roles
        const roleIds = userRoles.map(r => r.role_id);
        const { data: rolePermissions, error: permissionsError } = await supabase
          .from('role_permissions')
          .select('permission_id')
          .in('role_id', roleIds);
          
        if (permissionsError) throw permissionsError;

        if (!rolePermissions || rolePermissions.length === 0) {
          setPermissions([]);
          setLoading(false);
          return;
        }

        // Get permission names
        const permissionIds = rolePermissions.map(p => p.permission_id);
        const { data: permissionDetails, error: detailsError } = await supabase
          .from('permissions')
          .select('name')
          .in('id', permissionIds);
          
        if (detailsError) throw detailsError;

        setPermissions(permissionDetails.map(p => p.name));
      } catch (error) {
        console.error('Error fetching app permissions:', error);
        setPermissions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [userId]);

  return { permissions, loading };
};

export const getAppsList = (notificationCounts: NotificationCounts, userId?: string): AppItem[] => {
  const { permissions, loading } = useAppPermissions(userId);
  const [visibleApps, setVisibleApps] = useState<AppItem[]>([]);

  useEffect(() => {
    const allApps: AppItem[] = [
      {
        title: "إدارة الفعاليات",
        icon: ListChecks,
        path: "/",
        description: "إدارة وتنظيم الفعاليات والأنشطة",
        notifications: 0,
        permissionRequired: "view_events_app"
      },
      {
        title: "إدارة المستندات",
        icon: Database,
        path: "/documents",
        description: "إدارة وتنظيم المستندات والملفات",
        notifications: 0,
        permissionRequired: "view_documents_app"
      },
      {
        title: "إدارة المهام",
        icon: Clock,
        path: "/tasks",
        description: "إدارة وتتبع المهام والمشاريع",
        notifications: notificationCounts.tasks,
        permissionRequired: "view_tasks_app"
      },
      {
        title: "إدارة الأفكار",
        icon: Lightbulb,
        path: "/ideas",
        description: "إدارة وتنظيم الأفكار والمقترحات",
        notifications: notificationCounts.ideas,
        permissionRequired: "view_ideas_app"
      },
      {
        title: "إدارة الأموال",
        icon: DollarSign,
        path: "/finance",
        description: "إدارة الميزانية والمصروفات",
        notifications: notificationCounts.finance,
        permissionRequired: "view_finance_app"
      },
      {
        title: "إدارة المستخدمين",
        icon: Users,
        path: "/admin/users-management",
        description: "إدارة حسابات المستخدمين والصلاحيات",
        notifications: 0,
        permissionRequired: "view_users_app"
      },
      {
        title: "الموقع الإلكتروني",
        icon: Globe,
        path: "/website",
        description: "إدارة وتحديث محتوى الموقع الإلكتروني",
        notifications: 0,
        permissionRequired: "view_website_app"
      },
      {
        title: "المتجر الإلكتروني",
        icon: ShoppingCart,
        path: "/store",
        description: "إدارة المنتجات والطلبات في المتجر الإلكتروني",
        notifications: 0,
        permissionRequired: "view_store_app"
      },
      {
        title: "الإشعارات",
        icon: Bell,
        path: "/notifications",
        description: "عرض وإدارة إشعارات النظام",
        notifications: notificationCounts.notifications,
        permissionRequired: "view_notifications_app"
      },
      {
        title: "إدارة الطلبات",
        icon: Inbox,
        path: "/requests",
        description: "إدارة ومتابعة الطلبات والاستمارات والاعتمادات",
        notifications: 0,
        permissionRequired: "view_requests_app"
      },
      {
        title: "المطورين",
        icon: Code,
        path: "/admin/developer-settings",
        description: "إعدادات وأدوات المطورين",
        notifications: 0,
        permissionRequired: "view_developer_app"
      }
    ];

    if (loading) {
      // While loading, show all apps or no apps as desired
      setVisibleApps(allApps);
      return;
    }

    // If user is admin, show all apps
    const isAdmin = permissions.includes('admin_access') || 
                    permissions.includes('admin') || 
                    permissions.some(p => p.includes('admin'));

    if (isAdmin) {
      setVisibleApps(allApps);
      return;
    }

    // Filter apps based on permissions
    const filtered = allApps.filter(app => 
      // Show app if user has the specific permission, or no permission is required
      !app.permissionRequired || permissions.includes(app.permissionRequired)
    );

    setVisibleApps(filtered);
  }, [permissions, loading, notificationCounts]);

  return visibleApps;
};
