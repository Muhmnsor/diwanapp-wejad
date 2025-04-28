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
  Code,
  BriefcaseIcon,
  Calculator,
  CalendarClock,
  Mail,
  Bookmark,
  BarChart4
} from "lucide-react";
import { AppItem } from "./DashboardApps";
import { NotificationCounts } from "@/hooks/dashboard/useNotificationCounts";
import { User } from "@/store/refactored-auth/types";
import { supabase } from "@/integrations/supabase/client";

// For backwards compatibility until migration is complete
// Eventually this will be removed once all permissions are managed through the UI
export const APP_ROLE_ACCESS = {
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
    'idea_reviewer', 'idea_creator', 'innovation_manager',
    'event_media' // Added event_media to ideas access
  ],
  finance: [
    'admin', 'app_admin', 'developer',
    'finance_manager', 'financial_manager', 'accountant',
    'budget_manager', 'resource_manager',
    'event_media' // Added event_media to finance access
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
    'admin', 'app_admin', 'developer'
  ],
  hr: [
    'admin', 'app_admin', 'developer',
    'hr_manager'
  ],
  correspondence: [
  'admin', 'app_admin', 'developer',
  'document_manager', 'document_reviewer', 'document_creator',
  'office_manager', 'correspondence_manager'
  ],
  accounting: [
    'admin', 'app_admin', 'developer',
    'finance_manager', 'financial_manager', 'accountant'
  ],
  meetings: [
    'admin', 'app_admin', 'developer',
    'meeting_organizer', 'meeting_participant'
  ],
  internal_mail: [
    'admin', 'app_admin', 'developer'
  ],
  subscriptions: [
    'admin', 'app_admin', 'developer',
    'subscription_manager'
  ]
};

// Comprehensive role mapping between Arabic and English
export const ROLE_MAPPING = {
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
  'المدير_المالي': 'financial_manager',
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
  'منظم_الاجتماعات': 'meeting_organizer',
  'مشارك_في_الاجتماعات': 'meeting_participant',
  'مدير_الاشتراكات': 'subscription_manager',
  
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
  'مدير الموارد البشرية': 'hr_manager',
  'منظم الاجتماعات': 'meeting_organizer',
  'مشارك في الاجتماعات': 'meeting_participant',
  'مدير الاشتراكات': 'subscription_manager',
  'مدير الخطة الاستراتيجية': 'strategy_manager',
  
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
  'financial_manager': 'financial_manager',
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
  'developer': 'developer',
  'meeting_organizer': 'meeting_organizer',
  'meeting_participant': 'meeting_participant',
  'subscription_manager': 'subscription_manager'
  'strategy_manager': 'strategy_manager'
  
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
    title: "إدارة الوثائق",
    icon: Database,
    path: "/documents",
    description:  "إدارة وتنظيم المستندات والملفات والنماذج",
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
    title: "إدارة التقديرات",
    icon: DollarSign,
    path: "/finance",
    description: "إدارة تقديرات المشاريع",
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
    description: "إدارة منتجات التبرع في المتجر الإلكتروني",
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
  },
  {
    title: "إدارة شؤون الموظفين",
    icon: BriefcaseIcon,
    path: "/admin/hr",
    description: "إدارة المعلومات والعمليات المتعلقة بالموظفين",
    notifications: 0
  },
  {
  title: "الصادر والوارد",
  icon: Inbox,
  path: "/admin/correspondence",
  description: "نظام إدارة الصادر والوارد والخطابات الرسمية",
  notifications: 0
  },
  {
    title: "إدارة المحاسبة",
    icon: Calculator,
    path: "/admin/accounting",
    description: "إدارة الميزانية والشؤون المالية",
    notifications: 0
  },
  {
    title: "إدارة الاجتماعات",
    icon: CalendarClock,
    path: "/admin/meetings",
    description: "إدارة جدول الاجتماعات والمشاركين والمحاضر",
    notifications: 0
  },
  {
    title: "البريد الداخلي",
    icon: Mail,
    path: "/admin/internal-mail",
    description: "نظام البريد الداخلي والمراسلات",
    notifications: 0
  },
  {
    title: "إدارة الاشتراكات",
    icon: Bookmark,
    path: "/admin/subscriptions",
    description: "إدارة الاشتراكات والعضويات",
    notifications: 0
  }
    {
    title: "الخطة الاستراتيجية",
    icon: BarChart4,
    path: "/admin/strategy",
    description: "إدارة الخطة الاستراتيجية وبطاقات الأداء المتوازن",
    notifications: 0
  }
];

// Cache for role permissions to avoid redundant database calls
let rolePermissionsCache: Record<string, string[]> = {};
let cacheExpiry = 0;
const CACHE_DURATION = 60000; // 1 minute

/**
 * Check if a role has access to an app through database permissions
 */
const checkDbAppAccess = async (role: string, appKey: string): Promise<boolean> => {
  try {
    // Check if we have a valid cache
    const now = Date.now();
    if (now > cacheExpiry) {
      // Cache expired, clear it
      rolePermissionsCache = {};
      cacheExpiry = now + CACHE_DURATION;
    }

    // Check if role is in cache
    if (!rolePermissionsCache[role]) {
      // Get role ID first
      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', role)
        .single();

      if (roleError || !roleData) {
        console.error('Error fetching role:', roleError);
        return false;
      }

      // Get app permissions for this role
      const { data: permissions, error: permError } = await supabase
        .from('app_permissions')
        .select('app_name')
        .eq('role_id', roleData.id);

      if (permError) {
        console.error('Error fetching app permissions:', permError);
        return false;
      }

      // Store in cache
      rolePermissionsCache[role] = permissions.map(p => p.app_name);
    }

    // Check if the app is in the permissions
    return rolePermissionsCache[role].includes(appKey);
  } catch (error) {
    console.error('Error in checkDbAppAccess:', error);
    return false;
  }
};

// Helper function to check if user is admin or developer
const isAdminOrDeveloper = async (userId: string): Promise<boolean> => {
  try {
    const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin', { user_id: userId });
    
    if (adminError) {
      console.error('Error checking admin status:', adminError);
      return false;
    }
    
    return !!isAdmin;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Helper function to check if user has access to HR app
const hasHRAccess = async (userId: string): Promise<boolean> => {
  try {
    // First check if user is admin/developer
    const adminAccess = await isAdminOrDeveloper(userId);
    if (adminAccess) {
      return true;
    }
    
    // If not, check specific HR access
    const { data, error } = await supabase.rpc('has_hr_access', { user_id: userId });
    
    if (error) {
      console.error('Error checking HR access:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('Error checking HR access:', error);
    return false;
  }
};

// Get applications list based on user role
export const getAppsList = async (notificationCounts: NotificationCounts, user?: User | null): Promise<AppItem[]> => {
  // If no user is provided, return an empty array
  if (!user) return [];
  
  console.log('GetAppsList - User:', { 
    id: user.id, 
    email: user.email, 
    role: user.role,
    isAdmin: user.isAdmin
  });
  
  // Get user role and normalize it
  const userRole = user.role || '';
  console.log('User role before mapping:', userRole);

  // Map the role to its English equivalent if needed
  let mappedRole = ROLE_MAPPING[userRole as keyof typeof ROLE_MAPPING] || userRole;
  
  // Check if user is admin/developer (they get access to all apps)
  const isAdmin = await isAdminOrDeveloper(user.id);
  console.log('User is admin/developer:', isAdmin);
  
  let filteredApps: AppItem[] = [];
  
  // Process each app to check permissions
  for (const app of ALL_APPS) {
    const appKey = getAppKeyFromPath(app.path);
    if (!appKey) continue;
    
    let hasAccess = false;


    // Admin/developer gets access to all apps
    if (isAdmin) {
      hasAccess = true;
    } else {
      // First check database permissions
      hasAccess = await checkDbAppAccess(mappedRole, appKey);
      
      // If no database permission, fall back to hardcoded permissions
      if (!hasAccess) {
        const allowedRoles = APP_ROLE_ACCESS[appKey as keyof typeof APP_ROLE_ACCESS] || [];
        hasAccess = allowedRoles.includes(mappedRole);
      }
      
      // Special handling for HR app
      if (appKey === 'hr' && !hasAccess) {
        hasAccess = await hasHRAccess(user.id);
      }
    }
    
    if (hasAccess) {
      filteredApps.push({
        ...app,
        notifications: getNotificationCount(app.path, notificationCounts)
      });
    }
  }
  
  console.log('Filtered apps for role', mappedRole, ':', filteredApps.length);
  return filteredApps;
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
  if (path === '/admin/hr') return 'hr';
  if (path === '/admin/accounting') return 'accounting';
  if (path === '/admin/meetings') return 'meetings';
  if (path === '/admin/internal-mail') return 'internal_mail';
  if (path === '/admin/subscriptions') return 'subscriptions';
  if (path === '/admin/correspondence') return 'correspondence';
  if (path === '/admin/strategy') return 'strategy';
  return null;
};

// Helper function to get notification count for an app
const getNotificationCount = (path: string, counts: NotificationCounts): number => {
  if (path === '/notifications') return counts.notifications;
  if (path === '/tasks') return counts.tasks;
  if (path === '/requests') return counts.approval_requests;
  if (path === '/documents') return counts.documents;
  if (path === '/admin/meetings') return counts.meetings;
  
  // Safe access for the new properties (they may not exist in the counts object yet)
  if (path === '/admin/hr') return counts.hr || 0;
  if (path === '/admin/accounting') return counts.accounting || 0;
  if (path === '/admin/internal-mail') return counts.internal_mail || 0;
  if (path === '/admin/subscriptions') return counts.subscriptions || 0;
  if (path === '/ideas') return counts.ideas || 0;
  if (path === '/finance') return counts.finance || 0;
  if (path === '/admin/correspondence') return counts.correspondence || 0;
  if (path === '/admin/strategy') return counts.strategy || 0;
  
  return 0;
};
