import { ProfileData } from "@/types/profileData";
import { 
  Users, 
  DollarSign, 
  ListChecks, 
  Lightbulb, 
  Database, 
  Globe, 
  ShoppingCart,
  Clock,
  Inbox
} from "lucide-react";
import { AppItem } from "./DashboardApps";
import { NotificationCountsResponse } from "@/hooks/dashboard/useNotificationCounts";
import { hasPermission } from "@/utils/permissionsUtils";
import { getStandardizedRole } from "@/utils/roleMapping";

export const ROLE_MAPPING: Record<string, StandardRoles> = {
  "مدير_النظام": "admin",
  "مدير_المحتوى": "content_manager",
  "مدير_الفعاليات": "event_manager",
  "مسؤول_التسجيل": "registration_manager",
  "مطور": "developer",
  "مدير_الحسابات": "accounting_manager",
  "مدير_الموظفين": "hr_manager",
  "موظف_الموارد_البشرية": "hr_staff",
  "مدير_المالية": "finance_manager",
  "محاسب": "accounting_staff",
  "مدير_المهام": "task_manager",
  "مدير_المشاريع": "project_manager",
  "منسق_المشاريع": "project_coordinator",
  "مدير_المستندات": "document_manager",
  "مدير_البريد": "mail_manager",
  
  // Arabic display names
  "مدير النظام": "admin",
  "مدير المحتوى": "content_manager",
  "مدير الفعاليات": "event_manager",
  "مسؤول التسجيل": "registration_manager",
  "مطور": "developer",
  "مدير الحسابات": "accounting_manager",
  "مدير الموظفين": "hr_manager",
  "موظف الموارد البشرية": "hr_staff",
  "مدير المالية": "finance_manager",
  "محاسب": "accounting_staff",
  "مدير المهام": "task_manager",
  "مدير المشاريع": "project_manager",
  "منسق المشاريع": "project_coordinator",
  "مدير المستندات": "document_manager",
  "مدير البريد": "mail_manager",
};

type StandardRoles =
  | "admin"
  | "content_manager"
  | "event_manager"
  | "registration_manager"
  | "developer"
  | "accounting_manager"
  | "hr_manager"
  | "hr_staff"
  | "finance_manager"
  | "accounting_staff"
  | "task_manager"
  | "project_manager"
  | "project_coordinator"
  | "document_manager"
  | "mail_manager";

export const APP_ROLE_ACCESS: Record<string, StandardRoles[]> = {
  events: ["admin", "event_manager", "registration_manager", "content_manager", "developer"],
  projects: ["admin", "project_manager", "project_coordinator", "developer"],
  tasks: ["admin", "task_manager", "project_manager", "developer"],
  hr: ["admin", "hr_manager", "hr_staff", "developer"],
  accounting: ["admin", "accounting_manager", "finance_manager", "accounting_staff", "developer"],
  documents: ["admin", "document_manager", "developer"],
  internalMail: ["admin", "mail_manager", "developer"]
};

export const getAppsList = async (
  notificationCounts: NotificationCountsResponse | undefined,
  user: ProfileData | null
): Promise<AppItem[]> => {
  const apps: AppItem[] = [];
  
  // Default notification counts
  const counts = notificationCounts || {
    events: 0,
    tasks: 0,
    projects: 0,
    meetings: 0,
    documents: 0,
    inbox: 0,
    notifications: 0
  };
  
  // Standardize user role
  let standardizedRole: StandardRoles | null = null;
  
  if (user?.role) {
    standardizedRole = getStandardizedRole(user.role);
    console.log('User role standardized:', user.role, '->', standardizedRole);
  }
  
  if (user?.roles && Array.isArray(user.roles)) {
    console.log('User has multiple roles:', user.roles);
  }
  
  let userHasPermission = false;
  
  // Events app
  userHasPermission = await checkAppAccess('events', user, standardizedRole);
  if (userHasPermission) {
    apps.push({
      title: "إدارة الفعاليات",
      icon: Clock,
      path: "/events/dashboard",
      description: "إدارة الفعاليات والتسجيلات",
      notifications: counts.events || 0,
    });
  }
  
  // Projects app
  userHasPermission = await checkAppAccess('projects', user, standardizedRole);
  if (userHasPermission) {
    apps.push({
      title: "إدارة المشاريع",
      icon: ListChecks,
      path: "/projects/dashboard",
      description: "إدارة المشاريع والأنشطة",
      notifications: counts.projects || 0,
    });
  }
  
  // Tasks app
  userHasPermission = await checkAppAccess('tasks', user, standardizedRole);
  if (userHasPermission) {
    apps.push({
      title: "إدارة المهام",
      icon: ListChecks,
      path: "/admin/tasks",
      description: "إدارة وتتبع المهام والمشاريع",
      notifications: counts.tasks || 0,
    });
  }
  
  // HR app
  userHasPermission = await checkAppAccess('hr', user, standardizedRole);
  if (userHasPermission) {
    apps.push({
      title: "الموارد البشرية",
      icon: Users,
      path: "/admin/hr",
      description: "إدارة الموظفين والحضور",
      notifications: 0,
    });
  }
  
  // Accounting app
  userHasPermission = await checkAppAccess('accounting', user, standardizedRole);
  if (userHasPermission) {
    apps.push({
      title: "الحسابات",
      icon: DollarSign,
      path: "/admin/accounting",
      description: "إدارة الميزانية والموارد المالية",
      notifications: 0,
    });
  }
  
  // Documents app
  userHasPermission = await checkAppAccess('documents', user, standardizedRole);
  if (userHasPermission) {
    apps.push({
      title: "المستندات",
      icon: Database,
      path: "/admin/documents",
      description: "إدارة المستندات والملفات",
      notifications: counts.documents || 0,
    });
  }
  
  // Internal Mail app
  userHasPermission = await checkAppAccess('internalMail', user, standardizedRole);
  if (userHasPermission) {
    apps.push({
      title: "البريد الداخلي",
      icon: Inbox,
      path: "/admin/internal-mail",
      description: "نظام المراسلات الداخلية",
      notifications: counts.inbox || 0,
    });
  }
  
  // Always add ideas app for authenticated users
  apps.push({
    title: "الأفكار",
    icon: Lightbulb,
    path: "/admin/ideas",
    description: "إدارة وتقييم الأفكار المقترحة",
    notifications: 0,
  });
  
  // Always add website app for authenticated users
  apps.push({
    title: "الموقع الإلكتروني",
    icon: Globe,
    path: "/admin/website",
    description: "إدارة محتوى الموقع الإلكتروني",
    notifications: 0,
  });
  
  // Always add shop app for authenticated users
  apps.push({
    title: "المتجر الإلكتروني",
    icon: ShoppingCart,
    path: "/admin/shop",
    description: "إدارة المتجر والمنتجات",
    notifications: 0,
  });
  
  console.log('Returning apps for user:', user?.email, 'count:', apps.length);
  
  return apps;
};

// Check if user has access to specific app
async function checkAppAccess(
  appKey: string, 
  user: ProfileData | null, 
  standardizedRole: StandardRoles | null
): Promise<boolean> {
  // Users with no data don't have access
  if (!user) return false;
  
  // Check if user has developer role
  const isDeveloperUser = await hasPermission(user.id, 'developer_tools:access');
  if (isDeveloperUser) {
    console.log(`User ${user.email} has developer access to ${appKey}`);
    return true;
  }
  
  // Check if user is admin
  if (standardizedRole === 'admin') {
    console.log(`User ${user.email} has admin access to ${appKey}`);
    return true;
  }
  
  // Check if user's standardized role is allowed
  if (standardizedRole && APP_ROLE_ACCESS[appKey]?.includes(standardizedRole)) {
    console.log(`User ${user.email} has role-based access to ${appKey} via ${standardizedRole}`);
    return true;
  }
  
  // Check if user has multiple roles
  if (user.roles && Array.isArray(user.roles)) {
    for (const roleObj of user.roles) {
      const roleStandardized = getStandardizedRole(roleObj.name);
      if (roleStandardized && APP_ROLE_ACCESS[appKey]?.includes(roleStandardized)) {
        console.log(`User ${user.email} has role-based access to ${appKey} via multiple roles: ${roleStandardized}`);
        return true;
      }
    }
  }
  
  console.log(`User ${user.email} does NOT have access to ${appKey}`);
  return false;
}
