
import { 
  Database, 
  ListChecks, 
  Lightbulb, 
  DollarSign, 
  Globe, 
  ShoppingCart, 
  Users, 
  Bell,
  BellRing,
  Clock,
  Inbox,
  Mail
} from "lucide-react";
import { AppItem } from "./DashboardApps";

// Role mapping from Arabic to English to standardize roles
// This is used to match roles from the database with the roles in the app
export const ROLE_MAPPING: Record<string, string> = {
  'مدير': 'admin',
  'مسؤول': 'admin',
  'مدير_النظام': 'admin',
  'مطور': 'developer',
  'مستخدم': 'user',
  'مشرف': 'moderator',
  'مراقب': 'moderator',
  'محرر': 'editor',
  'كاتب': 'writer',
  'مالي': 'finance',
  'محاسب': 'accountant',
  'منسق': 'coordinator',
  'مدير_مشاريع': 'project_manager',
  'مدير_مهام': 'task_manager',
  'مدير_فريق': 'team_leader',
  'قائد_فريق': 'team_leader',
  'عضو_فريق': 'team_member',
  'مدير_محتوى': 'content_manager',
  'مدير_تسويق': 'marketing_manager',
  'مسؤول_مبيعات': 'sales_manager',
  'خدمة_عملاء': 'customer_service',
  'موارد_بشرية': 'hr',
  'شؤون_الموظفين': 'hr'
};

// Define which roles have access to which apps
export const APP_ROLE_ACCESS: Record<string, string[]> = {
  'dashboard': ['admin', 'developer', 'moderator', 'user'],
  'tasks': ['admin', 'developer', 'task_manager', 'team_leader', 'team_member'],
  'documents': ['admin', 'developer', 'content_manager', 'editor', 'writer'],
  'finance': ['admin', 'developer', 'finance', 'accountant'],
  'website': ['admin', 'developer', 'content_manager', 'marketing_manager'],
  'store': ['admin', 'developer', 'sales_manager', 'marketing_manager'],
  'users': ['admin', 'developer', 'hr'],
  'notifications': ['admin', 'developer', 'moderator'],
  'requests': ['admin', 'developer', 'moderator', 'user'],
  'meetings': ['admin', 'developer', 'team_leader', 'project_manager'],
  'internal_mail': ['admin', 'developer', 'moderator', 'user', 'team_member']
};

// Helper function to get app key from path
export const getAppKeyFromPath = (path: string): string => {
  if (path.startsWith('/admin/dashboard')) return 'dashboard';
  if (path.startsWith('/tasks')) return 'tasks';
  if (path.startsWith('/documents')) return 'documents';
  if (path.startsWith('/finance')) return 'finance';
  if (path.startsWith('/website')) return 'website';
  if (path.startsWith('/store')) return 'store';
  if (path.startsWith('/users-management') || path.startsWith('/admin/users-management')) return 'users';
  if (path.startsWith('/notifications')) return 'notifications';
  if (path.startsWith('/requests')) return 'requests';
  if (path.startsWith('/admin/meetings')) return 'meetings';
  if (path.startsWith('/internal-mail')) return 'internal_mail';
  return '';
};

// All available apps that can be shown on the dashboard
export const ALL_APPS: AppItem[] = [
  {
    title: "المهام",
    icon: ListChecks,
    path: "/tasks",
    description: "إدارة المهام والمشاريع",
    notifications: 0
  },
  {
    title: "المستندات",
    icon: Database,
    path: "/documents",
    description: "إدارة المستندات والملفات",
    notifications: 0
  },
  {
    title: "الأفكار",
    icon: Lightbulb,
    path: "/ideas",
    description: "متابعة وتطوير الأفكار والمقترحات",
    notifications: 0
  },
  {
    title: "المالية",
    icon: DollarSign,
    path: "/finance",
    description: "إدارة الموارد المالية والميزانيات",
    notifications: 0
  },
  {
    title: "الموقع الإلكتروني",
    icon: Globe,
    path: "/website",
    description: "إدارة محتوى الموقع الإلكتروني",
    notifications: 0
  },
  {
    title: "المتجر الإلكتروني",
    icon: ShoppingCart,
    path: "/store",
    description: "إدارة المنتجات والمبيعات",
    notifications: 0
  },
  {
    title: "المستخدمين",
    icon: Users,
    path: "/admin/users-management",
    description: "إدارة المستخدمين والصلاحيات",
    notifications: 0
  },
  {
    title: "الإشعارات",
    icon: Bell,
    path: "/notifications",
    description: "إدارة الإشعارات والتنبيهات",
    notifications: 0
  },
  {
    title: "الطلبات",
    icon: BellRing,
    path: "/requests",
    description: "إدارة طلبات الموافقة والاعتماد",
    notifications: 0
  },
  {
    title: "إدارة الاجتماعات",
    icon: Clock,
    path: "/admin/meetings",
    description: "إدارة جدول الاجتماعات والمشاركين والمحاضر",
    notifications: 0
  },
  {
    title: "البريد الداخلي",
    icon: Mail,
    path: "/internal-mail",
    description: "إدارة المراسلات الداخلية بين أعضاء الفريق",
    notifications: 0
  }
];

// Function to get apps list based on user role and notifications
export const getAppsList = async (notificationCounts: any, user: any) => {
  console.log("Getting apps list for user:", user?.id, user?.role);
  
  if (!user) {
    console.warn("No user provided to getAppsList");
    return [];
  }

  try {
    // Start with all apps and filter based on role
    const userRoles = Array.isArray(user.roles) ? user.roles : [user.role].filter(Boolean);
    console.log("User roles:", userRoles);
    
    // Get standardized English roles
    const standardizedRoles = userRoles.map(role => {
      const standardRole = ROLE_MAPPING[role as keyof typeof ROLE_MAPPING] || role;
      console.log(`Role mapping: ${role} -> ${standardRole}`);
      return standardRole;
    });
    
    // Special case: Admin and Developer roles have access to all apps
    const isAdmin = standardizedRoles.some(role => role === 'admin' || role === 'developer');
    
    // Filter apps based on user roles
    const filteredApps = ALL_APPS.filter(app => {
      const appKey = getAppKeyFromPath(app.path);
      if (!appKey) return false;
      
      const hasAccess = isAdmin || 
        APP_ROLE_ACCESS[appKey]?.some(role => standardizedRoles.includes(role));
      
      if (hasAccess) {
        console.log(`User has access to ${app.title} (${appKey})`);
      }
      
      return hasAccess;
    });
    
    // Add notification counts to each app
    return filteredApps.map(app => {
      const notificationKey = getAppKeyFromPath(app.path);
      let count = 0;
      
      if (notificationKey === 'tasks') {
        count = notificationCounts?.tasks || 0;
      } else if (notificationKey === 'documents') {
        count = notificationCounts?.documents || 0;
      } else if (notificationKey === 'notifications') {
        count = notificationCounts?.notifications || 0;
      } else if (notificationKey === 'requests') {
        count = notificationCounts?.approval_requests || 0;
      } else if (notificationKey === 'meetings') {
        count = notificationCounts?.meetings || 0;
      } else if (notificationKey === 'internal_mail') {
        // This would be populated from a real notifications count in the future
        count = 0;
      }
      
      return {
        ...app,
        notifications: count
      };
    });
  } catch (error) {
    console.error("Error in getAppsList:", error);
    return [];
  }
};
