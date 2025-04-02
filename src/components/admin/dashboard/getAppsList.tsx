
import { 
  Database, 
  ListChecks, 
  Lightbulb, 
  DollarSign, 
  Globe, 
  ShoppingCart, 
  Users, 
  Bell,
  ClipboardList,
  Mail
} from "lucide-react";
import { AppItem } from "./DashboardApps";
import { supabase } from "@/integrations/supabase/client";
import { debugRoleMapping } from "@/utils/debugRoleMappings";

// Role mapping for Arabic to English roles
export const ROLE_MAPPING: Record<string, string> = {
  // Admin roles
  "مدير": "admin",
  "مشرف": "admin",
  "مدير_تطبيق": "app_admin",
  "مطور": "developer",
  
  // Feature-specific roles
  "مسؤول_فعاليات": "event_manager",
  "مدير_فعاليات": "event_manager",
  "مسؤول_اجتماعات": "meeting_manager",
  "مدير_اجتماعات": "meeting_manager",
  "مسؤول_مالي": "finance_manager",
  "مسؤول_الموقع": "website_manager",
  "مسؤول_المتجر": "store_manager",
  "مسؤول_موقع": "website_manager",
  "مسؤول_متجر": "store_manager",
  "مسؤول_مستخدمين": "user_manager",
  "مدير_الموارد_البشرية": "hr_manager",
  "مسؤول_الموارد_البشرية": "hr_manager",
  "محاسب": "accountant",
  "مسؤول_طلبات": "requests_manager",
  "مسؤول_المهام": "tasks_manager",
  "مسؤول_بريد": "mail_manager",
  
  // Regular user roles
  "مستخدم": "user",
  "متطوع": "volunteer"
};

// Define which roles can access which apps
export const APP_ROLE_ACCESS: Record<string, string[]> = {
  // Core admin apps
  "dashboard": ["admin", "app_admin", "developer"],
  "settings": ["admin", "app_admin", "developer"],
  
  // Feature-specific apps
  "events": ["admin", "app_admin", "developer", "event_manager"],
  "documents": ["admin", "app_admin", "developer", "document_manager"],
  "tasks": ["admin", "app_admin", "developer", "tasks_manager"],
  "finance": ["admin", "app_admin", "developer", "finance_manager", "accountant"],
  "website": ["admin", "app_admin", "developer", "website_manager"],
  "store": ["admin", "app_admin", "developer", "store_manager"],
  "users": ["admin", "app_admin", "developer", "user_manager"],
  "notifications": ["admin", "app_admin", "developer"],
  "requests": ["admin", "app_admin", "developer", "requests_manager"],
  "hr": ["admin", "app_admin", "developer", "hr_manager"],
  "accounting": ["admin", "app_admin", "developer", "accountant"],
  "meetings": ["admin", "app_admin", "developer", "meeting_manager"],
  "internal_mail": ["admin", "app_admin", "developer", "mail_manager"],
};

// Maps URL paths to app keys in APP_ROLE_ACCESS
const getAppKeyFromPath = (path: string): string => {
  const pathMapping: Record<string, string> = {
    "/admin/dashboard": "dashboard",
    "/settings": "settings",
    "/events": "events", 
    "/documents": "documents",
    "/tasks": "tasks",
    "/finance": "finance",
    "/website": "website",
    "/store": "store",
    "/users-management": "users",
    "/admin/users-management": "users",
    "/notifications": "notifications",
    "/requests": "requests",
    "/admin/hr": "hr",
    "/admin/accounting": "accounting",
    "/admin/meetings": "meetings",
    "/internal-mail": "internal_mail",
  };
  
  return pathMapping[path] || "";
};

// Check if a user can access a specific app
const canAccessApp = async (user: any, appPath: string): Promise<boolean> => {
  if (!user) return false;

  try {
    const appKey = getAppKeyFromPath(appPath);
    if (!appKey) return false;

    const allowedRoles = APP_ROLE_ACCESS[appKey] || [];
    
    // Super admins can access everything
    if (user.isAdmin) {
      console.log(`User is super admin, allowing access to ${appKey}`);
      return true;
    }
    
    // Query user roles table to get the user's roles
    const { data: userRolesData, error: rolesError } = await supabase
      .from('user_roles')
      .select(`
        roles:role_id (
          name
        )
      `)
      .eq('user_id', user.id);
      
    if (rolesError) {
      console.error('Error fetching user roles:', rolesError);
      return false;
    }
    
    // Extract role names and check against allowed roles
    const userRoles = userRolesData?.map(ur => {
      // Handle the role object correctly
      const roleObj = ur.roles as unknown as { name: string };
      return roleObj.name ? 
        debugRoleMapping(roleObj.name).mappedRole || roleObj.name : 
        null;
    }).filter(r => r !== null) || [];
    
    console.log(`User roles for ${appKey}:`, userRoles);
    console.log(`Allowed roles for ${appKey}:`, allowedRoles);
    
    const hasAccess = userRoles.some(role => allowedRoles.includes(role as string));
    console.log(`Access to ${appKey}: ${hasAccess}`);
    
    return hasAccess;
  } catch (error) {
    console.error('Error checking app access:', error);
    return false;
  }
};

export const getAppsList = async (notificationCounts: Record<string, number> = {}, user: any = null): Promise<AppItem[]> => {
  const apps: AppItem[] = [
    {
      title: "لوحة التحكم",
      icon: Database,
      path: "/admin/dashboard",
      description: "عرض إحصائيات النظام والوصول إلى جميع الوظائف",
      notifications: 0,
    },
    {
      title: "إدارة المستندات",
      icon: ClipboardList,
      path: "/documents",
      description: "إدارة وتنظيم المستندات والملفات",
      notifications: notificationCounts?.documents || 0,
    },
    {
      title: "إدارة المهام",
      icon: ListChecks,
      path: "/tasks",
      description: "إدارة المهام والمشاريع وتتبع التقدم",
      notifications: notificationCounts?.tasks || 0,
    },
    {
      title: "نظام الأفكار",
      icon: Lightbulb,
      path: "/ideas",
      description: "إدارة المقترحات والأفكار الجديدة",
      notifications: notificationCounts?.ideas || 0,
    },
    {
      title: "النظام المالي",
      icon: DollarSign,
      path: "/finance",
      description: "إدارة الميزانيات والموارد المالية",
      notifications: notificationCounts?.finance || 0,
    },
    {
      title: "إدارة الموقع",
      icon: Globe,
      path: "/website",
      description: "تحديث وتخصيص محتوى الموقع الإلكتروني",
      notifications: notificationCounts?.website || 0,
    },
    {
      title: "إدارة المتجر",
      icon: ShoppingCart,
      path: "/store",
      description: "إدارة المنتجات والمبيعات",
      notifications: notificationCounts?.store || 0,
    },
    {
      title: "إدارة المستخدمين",
      icon: Users,
      path: "/admin/users-management",
      description: "إدارة حسابات المستخدمين والصلاحيات",
      notifications: notificationCounts?.users || 0,
    },
    {
      title: "مركز الإشعارات",
      icon: Bell,
      path: "/notifications",
      description: "إعدادات وسجلات الإشعارات",
      notifications: notificationCounts?.notifications || 0,
    },
    {
      title: "نظام الطلبات",
      icon: ListChecks,
      path: "/requests",
      description: "إدارة الطلبات وسير العمل",
      notifications: notificationCounts?.requests || 0,
    },
    {
      title: "البريد الداخلي",
      icon: Mail,
      path: "/internal-mail",
      description: "نظام البريد الداخلي والمراسلات",
      notifications: notificationCounts?.internal_mail || 0,
    },
  ];

  // Filter apps based on user permissions
  if (user) {
    const accessibleApps: AppItem[] = [];
    
    for (const app of apps) {
      const hasAccess = await canAccessApp(user, app.path);
      if (hasAccess) {
        accessibleApps.push(app);
      }
    }
    
    return accessibleApps;
  }

  return apps;
};
