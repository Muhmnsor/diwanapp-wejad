
import { 
  Database, 
  ListChecks, 
  Lightbulb, 
  DollarSign, 
  Globe, 
  ShoppingCart, 
  Users, 
  Bell,
  Mail,
  Calendar,
  CalendarClock
} from "lucide-react";
import { AppItem } from "@/components/admin/dashboard/DashboardApps";
import { supabase } from "@/integrations/supabase/client";
import { debugRoleMapping } from "@/utils/debugRoleMappings";

// Standard role names in English (used in code)
export type StandardRoles = 
  | 'admin' 
  | 'user' 
  | 'hr_admin' 
  | 'finance_admin' 
  | 'events_admin' 
  | 'store_admin' 
  | 'website_admin' 
  | 'notification_admin'
  | 'developer'
  | 'internal_mail_admin';

// Map Arabic role names to standard English role names
export const ROLE_MAPPING: Record<string, StandardRoles> = {
  // Admin roles
  'مسؤول': 'admin',
  'admin': 'admin',
  'مدير_النظام': 'admin',
  'مدير': 'admin',
  
  // User role
  'مستخدم': 'user',
  'user': 'user',
  
  // HR admin role
  'مسؤول_الموارد_البشرية': 'hr_admin',
  'مدير_الموارد_البشرية': 'hr_admin',
  'hr_admin': 'hr_admin',
  'موارد_بشرية': 'hr_admin',
  'موارد بشرية': 'hr_admin',
  
  // Finance admin role
  'مسؤول_المالية': 'finance_admin',
  'مدير_المالية': 'finance_admin',
  'finance_admin': 'finance_admin',
  'محاسب': 'finance_admin',
  'مسؤول_محاسبة': 'finance_admin',
  'مالية': 'finance_admin',
  
  // Events admin role
  'مسؤول_الفعاليات': 'events_admin',
  'مدير_الفعاليات': 'events_admin',
  'events_admin': 'events_admin',
  'فعاليات': 'events_admin',
  
  // Store admin role
  'مسؤول_المتجر': 'store_admin',
  'مدير_المتجر': 'store_admin',
  'store_admin': 'store_admin',
  'متجر': 'store_admin',
  
  // Website admin role
  'مسؤول_الموقع': 'website_admin',
  'مدير_الموقع': 'website_admin',
  'website_admin': 'website_admin',
  'موقع': 'website_admin',
  
  // Notification admin role
  'مسؤول_الإشعارات': 'notification_admin',
  'مدير_الإشعارات': 'notification_admin',
  'notification_admin': 'notification_admin',
  'إشعارات': 'notification_admin',
  
  // Developer role
  'مطور': 'developer',
  'مبرمج': 'developer',
  'developer': 'developer',
  
  // Internal Mail admin role
  'مسؤول_البريد': 'internal_mail_admin',
  'مدير_البريد': 'internal_mail_admin',
  'بريد': 'internal_mail_admin',
  'internal_mail_admin': 'internal_mail_admin',
  'بريد_داخلي': 'internal_mail_admin'
};

// Define which roles have access to which apps
export const APP_ROLE_ACCESS: Record<string, StandardRoles[]> = {
  // All authenticated users can access tasks
  'tasks': ['admin', 'user', 'hr_admin', 'finance_admin', 'events_admin', 'store_admin', 'website_admin', 'notification_admin', 'developer', 'internal_mail_admin'],
  
  // Document access for all authenticated users
  'documents': ['admin', 'user', 'hr_admin', 'finance_admin', 'events_admin', 'store_admin', 'website_admin', 'notification_admin', 'developer', 'internal_mail_admin'],
  
  // HR access for HR admins and main admin
  'hr': ['admin', 'hr_admin', 'developer'],
  
  // Finance access for finance admins and main admin
  'finance': ['admin', 'finance_admin', 'developer'],
  
  // Website access for website admins and main admin
  'website': ['admin', 'website_admin', 'developer'],
  
  // Store access for store admins and main admin
  'store': ['admin', 'store_admin', 'developer'],
  
  // Users management for main admin only
  'users': ['admin', 'developer'],
  
  // Notifications access for notification admins and main admin
  'notifications': ['admin', 'notification_admin', 'developer'],
  
  // Requests access for all authenticated users
  'requests': ['admin', 'user', 'hr_admin', 'finance_admin', 'events_admin', 'store_admin', 'website_admin', 'notification_admin', 'developer', 'internal_mail_admin'],
  
  // Internal Mail access for mail admins and main admin
  'internal_mail': ['admin', 'internal_mail_admin', 'developer']
};

// Check if a user has a specific role
const hasRole = (userRoles: string[], role: StandardRoles): boolean => {
  if (!userRoles || userRoles.length === 0) {
    return false;
  }
  
  // Check for each user role if it maps to the required role
  return userRoles.some(userRole => {
    // Try to map the user role to a standard role
    const mappingResult = debugRoleMapping(userRole);
    const mappedRole = mappingResult.mappedRole;
    
    console.log(`Checking if '${userRole}' (mapped to '${mappedRole}') matches required role '${role}'`);
    
    // If the mapped role matches the required role or user is admin, grant access
    return mappedRole === role || mappedRole === 'admin' || mappedRole === 'developer';
  });
};

// Check if a user has access to an app based on roles
const hasAppAccess = (userRoles: string[], appKey: string): boolean => {
  if (!userRoles || userRoles.length === 0 || !appKey) {
    return false;
  }
  
  // Get the roles that can access this app
  const allowedRoles = APP_ROLE_ACCESS[appKey] || [];
  
  // Check if the user has any of the allowed roles
  return allowedRoles.some(role => hasRole(userRoles, role));
};

// Get the list of apps a user can access
export const getAppsList = async (
  notificationCounts: Record<string, number> | undefined, 
  user: { id: string, email?: string } | null
): Promise<AppItem[]> => {
  if (!user) {
    console.warn("No user provided to getAppsList");
    return [];
  }
  
  try {
    // Fetch user roles
    const { data: userRolesData, error } = await supabase
      .from('user_roles')
      .select('roles:role_id(id, name)')
      .eq('user_id', user.id);
    
    if (error) {
      console.error("Error fetching user roles:", error);
      return [];
    }
    
    // Extract role names from the response
    const userRoles = userRolesData
      ?.map(ur => ur.roles?.name)
      .filter(Boolean) || [];
    
    console.log(`User ${user.email} has roles:`, userRoles);
    
    // Define all possible apps
    const allApps: Record<string, AppItem> = {
      tasks: {
        title: "المهام",
        icon: ListChecks,
        path: "/tasks",
        description: "إدارة المهام والنشاطات",
        notifications: notificationCounts?.tasks || 0,
      },
      documents: {
        title: "المستندات",
        icon: Database,
        path: "/documents",
        description: "إدارة المستندات والملفات",
        notifications: notificationCounts?.documents || 0,
      },
      hr: {
        title: "الموارد البشرية",
        icon: Users,
        path: "/admin/hr",
        description: "إدارة شؤون الموظفين والحضور",
        notifications: notificationCounts?.hr || 0,
      },
      finance: {
        title: "الشؤون المالية",
        icon: DollarSign,
        path: "/admin/accounting",
        description: "إدارة الميزانية والمصروفات",
        notifications: notificationCounts?.finance || 0,
      },
      website: {
        title: "إدارة الموقع",
        icon: Globe,
        path: "/website",
        description: "إدارة محتوى الموقع الإلكتروني",
        notifications: notificationCounts?.website || 0,
      },
      store: {
        title: "المتجر الإلكتروني",
        icon: ShoppingCart,
        path: "/store",
        description: "إدارة المنتجات والمبيعات",
        notifications: notificationCounts?.store || 0,
      },
      users: {
        title: "إدارة المستخدمين",
        icon: Users,
        path: "/admin/users-management",
        description: "إدارة المستخدمين والصلاحيات",
        notifications: notificationCounts?.users || 0,
      },
      notifications: {
        title: "الإشعارات",
        icon: Bell,
        path: "/notifications",
        description: "إدارة وإرسال الإشعارات",
        notifications: notificationCounts?.notifications || 0,
      },
      requests: {
        title: "الطلبات",
        icon: ListChecks,
        path: "/requests",
        description: "إدارة طلبات الموظفين",
        notifications: notificationCounts?.requests || 0,
      },
      internal_mail: {
        title: "البريد الداخلي",
        icon: Mail,
        path: "/admin/internal-mail",
        description: "نظام المراسلات الداخلية",
        notifications: notificationCounts?.internal_mail || 0,
      },
    };
    
    // Filter apps based on user access
    const accessibleApps = Object.entries(allApps)
      .filter(([appKey]) => hasAppAccess(userRoles, appKey))
      .map(([_, app]) => app);
    
    console.log(`User ${user.email} has access to apps:`, accessibleApps.map(app => app.title));
    
    return accessibleApps;
  } catch (error) {
    console.error("Error in getAppsList:", error);
    return [];
  }
};
