
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

// Define roles for each application with comprehensive role access
const APP_ROLE_ACCESS = {
  events: [
    'admin', 'app_admin', 'developer',
    'event_manager', 'event_creator', 'event_coordinator',
    'event_executor', 'event_media', 'event_planner'
  ],
  documents: [
    'admin', 'app_admin', 'developer',
    'document_manager', 'finance_manager', 'financial_manager',
    'document_reviewer', 'document_creator'
  ],
  tasks: [
    'admin', 'app_admin', 'developer',
    'task_manager', 'project_manager', 'finance_manager', 
    'financial_manager', 'task_creator', 'team_leader'
  ],
  ideas: [
    'admin', 'app_admin', 'developer',
    'idea_manager', 'finance_manager', 'financial_manager',
    'idea_reviewer', 'idea_creator', 'innovation_manager'
  ],
  finance: [
    'admin', 'app_admin', 'developer',
    'finance_manager', 'financial_manager', 'accountant',
    'budget_manager', 'resource_manager'
  ],
  users: [
    'admin', 'app_admin', 'developer',
    'hr_manager', 'user_manager'
  ],
  website: [
    'admin', 'app_admin', 'developer',
    'content_manager', 'media_manager', 'web_editor'
  ],
  store: [
    'admin', 'app_admin', 'developer',
    'store_manager', 'inventory_manager', 'sales_manager'
  ],
  notifications: [
    'admin', 'app_admin', 'developer',
    'notification_manager', 'finance_manager', 'financial_manager',
    'communication_manager'
  ],
  requests: [
    'admin', 'app_admin', 'developer',
    'request_manager', 'finance_manager', 'financial_manager',
    'approval_manager'
  ],
  developer: [
    'admin', 'app_admin'
  ]
};

// Comprehensive role mapping between Arabic and English
const ROLE_MAPPING = {
  // Arabic to English - Common database roles
  'مدير': 'admin',
  'مدير_التطبيق': 'app_admin',
  'مدير_الفعاليات': 'event_manager',
  'منشئ_الفعاليات': 'event_creator',
  'منسق_الفعاليات': 'event_coordinator',
  'منفذ_الفعاليات': 'event_executor',
  'إعلامي_الفعاليات': 'event_media',
  'مخطط_الفعاليات': 'event_planner',
  'مدير_المستندات': 'document_manager',
  'مراجع_المستندات': 'document_reviewer',
  'منشئ_المستندات': 'document_creator',
  'مدير_المهام': 'task_manager',
  'مدير_المشاريع': 'project_manager',
  'منشئ_المهام': 'task_creator',
  'قائد_فريق': 'team_leader',
  'مدير_الأفكار': 'idea_manager',
  'مراجع_الأفكار': 'idea_reviewer',
  'منشئ_الأفكار': 'idea_creator',
  'مدير_الابتكار': 'innovation_manager',
  'مدير_مالي': 'finance_manager',
  'المدير_المالي': 'finance_manager', // Added for consistency
  'محاسب': 'accountant',
  'مدير_الميزانية': 'budget_manager',
  'مدير_الموارد': 'resource_manager',
  'مدير_الموارد_البشرية': 'hr_manager',
  'مدير_المستخدمين': 'user_manager',
  'مدير_المحتوى': 'content_manager',
  'مدير_الإعلام': 'media_manager',
  'محرر_موقع': 'web_editor',
  'مدير_المتجر': 'store_manager',
  'مدير_المخزون': 'inventory_manager',
  'مدير_المبيعات': 'sales_manager',
  'مدير_الإشعارات': 'notification_manager',
  'مدير_الاتصالات': 'communication_manager',
  'مدير_الطلبات': 'request_manager',
  'مدير_الموافقات': 'approval_manager',
  'مطور': 'developer',
  
  // Variations of Arabic role names (with spaces, different formats)
  'المدير': 'admin',
  'مدير التطبيق': 'app_admin',
  'مدير الفعاليات': 'event_manager',
  'منشئ الفعاليات': 'event_creator',
  'منسق الفعاليات': 'event_coordinator',
  'منفذ الفعاليات': 'event_executor',
  'إعلامي الفعاليات': 'event_media',
  'مخطط الفعاليات': 'event_planner',
  'مدير المستندات': 'document_manager',
  'مراجع المستندات': 'document_reviewer',
  'منشئ المستندات': 'document_creator',
  'مدير المهام': 'task_manager',
  'مدير المشاريع': 'project_manager',
  'منشئ المهام': 'task_creator',
  'قائد فريق': 'team_leader',
  'مدير الأفكار': 'idea_manager',
  'مراجع الأفكار': 'idea_reviewer',
  'منشئ الأفكار': 'idea_creator',
  'مدير الابتكار': 'innovation_manager',
  'مدير مالي': 'finance_manager',
  'المدير المالي': 'finance_manager',
  'محاسب': 'accountant',
  'مدير الميزانية': 'budget_manager',
  'مدير الموارد': 'resource_manager',
  'مدير الموارد البشرية': 'hr_manager',
  'مدير المستخدمين': 'user_manager',
  'مدير المحتوى': 'content_manager',
  'مدير الإعلام': 'media_manager',
  'محرر موقع': 'web_editor',
  'مدير المتجر': 'store_manager',
  'مدير المخزون': 'inventory_manager',
  'مدير المبيعات': 'sales_manager',
  'مدير الإشعارات': 'notification_manager',
  'مدير الاتصالات': 'communication_manager',
  'مدير الطلبات': 'request_manager',
  'مدير الموافقات': 'approval_manager',
  'مطور': 'developer',
  
  // English to English (for direct matching)
  'admin': 'admin',
  'app_admin': 'app_admin',
  'event_manager': 'event_manager',
  'event_creator': 'event_creator',
  'event_coordinator': 'event_coordinator',
  'event_executor': 'event_executor',
  'event_media': 'event_media',
  'event_planner': 'event_planner',
  'document_manager': 'document_manager',
  'document_reviewer': 'document_reviewer',
  'document_creator': 'document_creator',
  'task_manager': 'task_manager',
  'project_manager': 'project_manager',
  'task_creator': 'task_creator',
  'team_leader': 'team_leader',
  'idea_manager': 'idea_manager',
  'idea_reviewer': 'idea_reviewer',
  'idea_creator': 'idea_creator',
  'innovation_manager': 'innovation_manager',
  'finance_manager': 'finance_manager',
  'financial_manager': 'finance_manager', // Map financial_manager to finance_manager
  'accountant': 'accountant',
  'budget_manager': 'budget_manager',
  'resource_manager': 'resource_manager',
  'hr_manager': 'hr_manager',
  'user_manager': 'user_manager',
  'content_manager': 'content_manager',
  'media_manager': 'media_manager',
  'web_editor': 'web_editor',
  'store_manager': 'store_manager',
  'inventory_manager': 'inventory_manager',
  'sales_manager': 'sales_manager',
  'notification_manager': 'notification_manager',
  'communication_manager': 'communication_manager',
  'request_manager': 'request_manager',
  'approval_manager': 'approval_manager',
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
    // Only show apps the user has access to based on their role
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
  try {
    // Normalize role for comparison: handle both with and without spaces
    // Try different normalization approaches to maximize matching success
    
    // 1. Direct match first (if it's already in our standardized format)
    let mappedRole = ROLE_MAPPING[userRole as keyof typeof ROLE_MAPPING];
    
    // 2. Try with spaces replaced by underscores
    if (!mappedRole) {
      const normalizedWithUnderscores = userRole.trim().replace(/\s+/g, '_').toLowerCase();
      console.log('Trying with underscores:', normalizedWithUnderscores);
      mappedRole = ROLE_MAPPING[normalizedWithUnderscores as keyof typeof ROLE_MAPPING];
    }
    
    // 3. Try without any normalization (for roles already in English)
    if (!mappedRole) {
      console.log('Trying direct match for possible English role name:', userRole);
      // If the role itself is a valid English role, use it directly
      if (Object.values(ROLE_MAPPING).includes(userRole)) {
        mappedRole = userRole;
      }
    }
    
    if (!mappedRole) {
      console.warn('No role mapping found for:', userRole, 'This role is not recognized in the system.');
      return false;
    }
    
    console.log('Successfully mapped role:', userRole, '→', mappedRole, 'Checking access to app:', appKey);
    
    // Get allowed roles for the app
    const allowedRoles = APP_ROLE_ACCESS[appKey as keyof typeof APP_ROLE_ACCESS] || [];
    console.log('Allowed roles for', appKey, ':', allowedRoles);
    
    // Check if mapped role is in allowed roles
    const hasAccess = allowedRoles.includes(mappedRole);
    console.log('Has access to', appKey, ':', hasAccess);
    
    if (!hasAccess) {
      console.warn(`User with role "${userRole}" (mapped to "${mappedRole}") does not have access to app "${appKey}"`);
    }
    
    return hasAccess;
  } catch (error) {
    console.error('Error checking role access:', error);
    return false;
  }
};

// Helper function to get notification count for an app
const getNotificationCount = (path: string, counts: NotificationCounts): number => {
  if (path === '/tasks') return counts.tasks;
  if (path === '/ideas') return counts.ideas;
  if (path === '/finance') return counts.finance;
  if (path === '/notifications') return counts.notifications;
  
  return 0;
};
