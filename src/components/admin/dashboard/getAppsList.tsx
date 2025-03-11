
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
import { User } from "@/store/refactored-auth/types";

// Define roles for each application
const APP_ROLE_ACCESS = {
  events: ['admin', 'app_admin', 'event_creator', 'event_manager'],
  documents: ['admin', 'app_admin', 'document_manager', 'finance_manager', 'financial_manager'],
  tasks: ['admin', 'app_admin', 'task_manager', 'project_manager', 'finance_manager', 'financial_manager'],
  ideas: ['admin', 'app_admin', 'idea_manager', 'finance_manager', 'financial_manager'],
  finance: ['admin', 'app_admin', 'finance_manager', 'financial_manager'],
  users: ['admin', 'app_admin'],
  website: ['admin', 'app_admin', 'content_manager'],
  store: ['admin', 'app_admin', 'store_manager'],
  notifications: ['admin', 'app_admin', 'notification_manager', 'finance_manager', 'financial_manager'],
  requests: ['admin', 'app_admin', 'request_manager', 'finance_manager', 'financial_manager'],
  developer: ['admin', 'app_admin', 'developer']
};

// Role mapping between Arabic and English
const ROLE_MAPPING = {
  // Arabic to English
  'مدير': 'admin',
  'مدير_التطبيق': 'app_admin',
  'مدير_الفعاليات': 'event_manager',
  'منشئ_الفعاليات': 'event_creator',
  'مدير_المستندات': 'document_manager',
  'مدير_المهام': 'task_manager',
  'مدير_المشاريع': 'project_manager',
  'مدير_الأفكار': 'idea_manager',
  'مدير_مالي': 'finance_manager',
  'مدير_المحتوى': 'content_manager',
  'مدير_المتجر': 'store_manager',
  'مدير_الإشعارات': 'notification_manager',
  'مدير_الطلبات': 'request_manager',
  'مطور': 'developer',
  
  // English to English (for direct matching)
  'admin': 'admin',
  'app_admin': 'app_admin',
  'event_manager': 'event_manager',
  'event_creator': 'event_creator',
  'document_manager': 'document_manager',
  'task_manager': 'task_manager',
  'project_manager': 'project_manager',
  'idea_manager': 'idea_manager',
  'finance_manager': 'finance_manager',
  'financial_manager': 'finance_manager', // Map financial_manager to finance_manager
  'content_manager': 'content_manager',
  'store_manager': 'store_manager',
  'notification_manager': 'notification_manager',
  'request_manager': 'request_manager',
  'developer': 'developer'
};

// Define the list of all available applications
const ALL_APPS: AppItem[] = [
  {
    title: "إدارة الفعاليات",
    icon: ListChecks,
    path: "/",
    description: "إدارة وتنظيم الفعاليات والأنشطة",
    notifications: 0
  },
  {
    title: "إدارة المستندات",
    icon: Database,
    path: "/documents",
    description: "إدارة وتنظيم المستندات والملفات",
    notifications: 0
  },
  {
    title: "إدارة المهام",
    icon: Clock,
    path: "/tasks",
    description: "إدارة وتتبع المهام والمشاريع",
    notifications: 0
  },
  {
    title: "إدارة الأفكار",
    icon: Lightbulb,
    path: "/ideas",
    description: "إدارة وتنظيم الأفكار والمقترحات",
    notifications: 0
  },
  {
    title: "إدارة الأموال",
    icon: DollarSign,
    path: "/finance",
    description: "إدارة الميزانية والمصروفات",
    notifications: 0
  },
  {
    title: "إدارة المستخدمين",
    icon: Users,
    path: "/admin/users-management",
    description: "إدارة حسابات المستخدمين والصلاحيات",
    notifications: 0
  },
  {
    title: "الموقع الإلكتروني",
    icon: Globe,
    path: "/website",
    description: "إدارة وتحديث محتوى الموقع الإلكتروني",
    notifications: 0
  },
  {
    title: "المتجر الإلكتروني",
    icon: ShoppingCart,
    path: "/store",
    description: "إدارة المنتجات والطلبات في المتجر الإلكتروني",
    notifications: 0
  },
  {
    title: "الإشعارات",
    icon: Bell,
    path: "/notifications",
    description: "عرض وإدارة إشعارات النظام",
    notifications: 0
  },
  {
    title: "إدارة الطلبات",
    icon: Inbox,
    path: "/requests",
    description: "إدارة ومتابعة الطلبات والاستمارات والاعتمادات",
    notifications: 0
  },
  {
    title: "المطورين",
    icon: Code,
    path: "/admin/developer-settings",
    description: "إعدادات وأدوات المطورين",
    notifications: 0
  }
];

// Get applications list based on user role
export const getAppsList = (notificationCounts: NotificationCounts, user?: User | null): AppItem[] => {
  // If no user is provided, return an empty array
  if (!user) return [];
  
  console.log('GetAppsList - User:', { 
    id: user.id, 
    email: user.email, 
    role: user.role,
    isAdmin: user.isAdmin
  });
  
  // If user is admin, return all apps with notifications
  if (user.isAdmin) {
    console.log('User is admin, showing all apps');
    return ALL_APPS.map(app => ({
      ...app,
      notifications: getNotificationCount(app.path, notificationCounts)
    }));
  }
  
  // Get user role and normalize it
  const userRole = user.role || '';
  console.log('User role before mapping:', userRole);
  
  // For non-admin users, filter apps based on role
  const filteredApps = ALL_APPS.filter(app => {
    const appKey = getAppKeyFromPath(app.path);
    return appKey ? hasAccessToApp(userRole, appKey) : false;
  });
  
  console.log('Filtered apps for role', userRole, ':', filteredApps.length);
  
  // Add notification counts to filtered apps
  return filteredApps.map(app => ({
    ...app,
    notifications: getNotificationCount(app.path, notificationCounts)
  }));
};

// Helper function to get app key from path
const getAppKeyFromPath = (path: string): string | null => {
  if (path === '/') return 'events';
  if (path === '/documents') return 'documents';
  if (path === '/tasks') return 'tasks';
  if (path === '/ideas') return 'ideas';
  if (path === '/finance') return 'finance';
  if (path === '/admin/users-management') return 'users';
  if (path === '/website') return 'website';
  if (path === '/store') return 'store';
  if (path === '/notifications') return 'notifications';
  if (path === '/requests') return 'requests';
  if (path === '/admin/developer-settings') return 'developer';
  
  return null;
};

// Helper function to check if user role has access to app
const hasAccessToApp = (userRole: string, appKey: string): boolean => {
  // Normalize role for comparison: replace spaces with underscores and convert to lowercase
  const normalizedRole = userRole.trim().replace(/\s+/g, '_').toLowerCase();
  console.log('Normalized role:', normalizedRole);
  
  // Map the normalized role to a standard English role name if a mapping exists
  const mappedRole = ROLE_MAPPING[normalizedRole as keyof typeof ROLE_MAPPING] || normalizedRole;
  console.log('Mapped role:', mappedRole);
  
  // Get allowed roles for the app
  const allowedRoles = APP_ROLE_ACCESS[appKey as keyof typeof APP_ROLE_ACCESS] || [];
  console.log('Allowed roles for', appKey, ':', allowedRoles);
  
  // Check if mapped role is in allowed roles
  const hasAccess = allowedRoles.includes(mappedRole);
  console.log('Has access:', hasAccess);
  
  return hasAccess;
};

// Helper function to get notification count for an app
const getNotificationCount = (path: string, counts: NotificationCounts): number => {
  if (path === '/tasks') return counts.tasks;
  if (path === '/ideas') return counts.ideas;
  if (path === '/finance') return counts.finance;
  if (path === '/notifications') return counts.notifications;
  
  return 0;
};
