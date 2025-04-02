
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AppItem } from "@/components/admin/dashboard/DashboardApps";

// Define role access for different apps
export const APP_ROLE_ACCESS = {
  documents: ['admin', 'manager', 'staff', 'user', 'developer'],
  tasks: ['admin', 'manager', 'staff', 'user', 'developer'],
  ideas: ['admin', 'manager', 'staff', 'user', 'developer'],
  finance: ['admin', 'finance_manager', 'accountant', 'developer'],
  website: ['admin', 'content_manager', 'developer'],
  internal_mail: ['admin', 'manager', 'staff', 'user', 'developer'],
  store: ['admin', 'store_manager', 'inventory_manager', 'developer'],
  users: ['admin', 'hr_manager', 'developer'],
  notifications: ['admin', 'manager', 'developer'],
  requests: ['admin', 'manager', 'staff', 'developer'],
  meetings: ['admin', 'manager', 'staff', 'developer'],
};

// Map Arabic role names to standardized English role names
export const ROLE_MAPPING = {
  'مدير': 'admin',
  'مدير_النظام': 'admin',
  'مدير النظام': 'admin',
  'مطور': 'developer',
  'مدير_المحتوى': 'content_manager',
  'مدير المحتوى': 'content_manager',
  'مدير_المتجر': 'store_manager',
  'مدير المتجر': 'store_manager',
  'مدير_المخزون': 'inventory_manager',
  'مدير المخزون': 'inventory_manager',
  'مدير_الموارد_البشرية': 'hr_manager',
  'مدير الموارد البشرية': 'hr_manager',
  'مدير_مالي': 'finance_manager',
  'مدير مالي': 'finance_manager',
  'محاسب': 'accountant',
  'موظف': 'staff',
  'مستخدم': 'user',
  // Add more mappings as needed
};

// Helper function to normalize role name
const normalizeRoleName = (roleName: string) => {
  return ROLE_MAPPING[roleName] || roleName;
};

export const getAppsList = async (notificationCounts: any, user: any): Promise<AppItem[]> => {
  try {
    if (!user) {
      console.log("No user provided");
      return [];
    }

    // Get user's roles from the database
    const { data: userRolesData, error: userRolesError } = await supabase
      .from('user_roles')
      .select('roles:role_id(name)')
      .eq('user_id', user.id);

    if (userRolesError) {
      console.error("Error fetching user roles:", userRolesError);
      toast.error("حدث خطأ في جلب أدوار المستخدم");
      return [];
    }

    // Extract role names from the fetched data
    const userRoles = userRolesData?.map(role => {
      // Handle the different possible structures of the role data
      const roleName = role.roles && typeof role.roles === 'object' ? 
        (role.roles as any).name : null;
      return normalizeRoleName(roleName);
    }).filter(Boolean) || [];

    console.log("User roles after normalization:", userRoles);

    // Check if user is admin or developer (they get access to all apps)
    const isAdmin = userRoles.some(role => role === 'admin' || role === 'developer' || role === 'app_admin');

    // Define apps with their access requirements
    const appDefinitions = [
      {
        title: "الوثائق والملفات",
        icon: Database,
        path: "/documents",
        description: "إدارة وتنظيم مستندات المنظمة",
        notifications: notificationCounts?.documents || 0,
        roles: APP_ROLE_ACCESS.documents
      },
      {
        title: "المهام",
        icon: ListChecks,
        path: "/tasks",
        description: "إدارة المهام والمشاريع",
        notifications: notificationCounts?.tasks || 0,
        roles: APP_ROLE_ACCESS.tasks
      },
      {
        title: "الأفكار",
        icon: Lightbulb,
        path: "/ideas",
        description: "إدارة وتقييم الأفكار الجديدة",
        notifications: notificationCounts?.ideas || 0,
        roles: APP_ROLE_ACCESS.ideas
      },
      {
        title: "المالية",
        icon: DollarSign,
        path: "/finance",
        description: "إدارة الموارد المالية والميزانيات",
        notifications: notificationCounts?.finance || 0,
        roles: APP_ROLE_ACCESS.finance
      },
      {
        title: "الموقع الإلكتروني",
        icon: Globe,
        path: "/website",
        description: "إدارة محتوى الموقع الإلكتروني",
        notifications: notificationCounts?.website || 0,
        roles: APP_ROLE_ACCESS.website
      },
      {
        title: "البريد الداخلي",
        icon: Mail,
        path: "/internal-mail",
        description: "إدارة المراسلات الداخلية",
        notifications: 0,
        roles: APP_ROLE_ACCESS.internal_mail
      },
      {
        title: "المتجر الإلكتروني",
        icon: ShoppingCart,
        path: "/store",
        description: "إدارة المنتجات والمبيعات",
        notifications: notificationCounts?.store || 0,
        roles: APP_ROLE_ACCESS.store
      },
      {
        title: "إدارة المستخدمين",
        icon: Users,
        path: "/admin/users-management",
        description: "إدارة المستخدمين والصلاحيات",
        notifications: notificationCounts?.users || 0,
        roles: APP_ROLE_ACCESS.users
      },
      {
        title: "الإشعارات",
        icon: Bell,
        path: "/notifications",
        description: "إدارة إعدادات الإشعارات",
        notifications: notificationCounts?.notificationSettings || 0,
        roles: APP_ROLE_ACCESS.notifications
      },
      {
        title: "الطلبات",
        icon: Inbox,
        path: "/requests",
        description: "إدارة طلبات المستخدمين",
        notifications: notificationCounts?.requests || 0,
        roles: APP_ROLE_ACCESS.requests
      }
    ];

    // Filter apps based on user's roles
    const accessibleApps = appDefinitions.filter(app => {
      // Admin/Developer gets access to all apps
      if (isAdmin) return true;
      
      // Check if user has any role that grants access to this app
      return userRoles.some(userRole => app.roles.includes(userRole));
    });

    return accessibleApps;
  } catch (error) {
    console.error("Error loading apps:", error);
    toast.error("حدث خطأ في تحميل التطبيقات");
    return [];
  }
};
