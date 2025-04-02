
import { AppItem } from "./DashboardApps";
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
  Inbox,
  Clock
} from "lucide-react";
import { APP_ROLE_ACCESS } from "@/utils/roleMapping";
import { supabase } from "@/integrations/supabase/client";

export const getAppsList = async (notificationCounts: any, user: any): Promise<AppItem[]> => {
  const apps: AppItem[] = [];
  
  // Fetch user roles from the database
  const { data: userRoles, error: rolesError } = await supabase
    .from("user_roles")
    .select(`
      role_id,
      roles:role_id (
        name
      )
    `)
    .eq("user_id", user.id);
  
  if (rolesError) {
    console.error("Error fetching user roles:", rolesError);
    return [];
  }
  
  // Extract role names from the user roles data
  const userRoleNames = userRoles?.map(userRole => {
    if (userRole.roles && typeof userRole.roles === 'object') {
      const roleName = userRole.roles as unknown as { name: string };
      return roleName.name;
    }
    return null;
  }).filter(Boolean) || [];
  
  console.log("User roles:", userRoleNames);
  
  // Helper function to check if user has access to an app
  const hasAccessToApp = (appName: string): boolean => {
    const allowedRoles = APP_ROLE_ACCESS[appName] || [];
    return userRoleNames.some(role => allowedRoles.includes(role as string));
  };
  
  // Check access for HR app
  if (hasAccessToApp('hr')) {
    apps.push({
      title: "الموارد البشرية",
      icon: Users,
      path: "/admin/hr",
      description: "إدارة شؤون الموظفين والحضور والإجازات",
      notifications: notificationCounts?.hr || 0,
    });
  }
  
  // Check access for accounting app
  if (hasAccessToApp('accounting')) {
    apps.push({
      title: "المحاسبة",
      icon: DollarSign,
      path: "/admin/accounting",
      description: "إدارة الشؤون المالية والميزانيات والمصروفات",
      notifications: notificationCounts?.accounting || 0,
    });
  }
  
  // Check access for website app
  if (hasAccessToApp('website')) {
    apps.push({
      title: "الموقع الإلكتروني",
      icon: Globe,
      path: "/website",
      description: "إدارة محتوى الموقع الإلكتروني والصفحات",
      notifications: notificationCounts?.website || 0,
    });
  }
  
  // Check access for store app
  if (hasAccessToApp('store')) {
    apps.push({
      title: "المتجر الإلكتروني",
      icon: ShoppingCart,
      path: "/store",
      description: "إدارة المتجر وعرض المنتجات والطلبات",
      notifications: notificationCounts?.store || 0,
    });
  }
  
  // Check access for tasks app
  if (hasAccessToApp('tasks')) {
    apps.push({
      title: "المهام",
      icon: ListChecks,
      path: "/tasks",
      description: "إدارة المهام ومتابعة الإنجاز والتقارير",
      notifications: notificationCounts?.tasks || 0,
    });
  }
  
  // Check access for documents app
  if (hasAccessToApp('documents')) {
    apps.push({
      title: "المستندات",
      icon: Database,
      path: "/documents",
      description: "إدارة المستندات والملفات المشتركة",
      notifications: notificationCounts?.documents || 0,
    });
  }
  
  // Check access for ideas app
  if (hasAccessToApp('ideas')) {
    apps.push({
      title: "الأفكار والمبادرات",
      icon: Lightbulb,
      path: "/ideas",
      description: "إدارة الأفكار والمبادرات ومتابعتها",
      notifications: notificationCounts?.ideas || 0,
    });
  }
  
  // Check access for notifications app
  if (hasAccessToApp('notifications')) {
    apps.push({
      title: "الإشعارات",
      icon: Bell,
      path: "/notifications",
      description: "إدارة إشعارات التطبيق وسجل الرسائل",
      notifications: notificationCounts?.notificationSystem || 0,
    });
  }

  // Check access for internal mail app
  if (hasAccessToApp('internal_mail')) {
    apps.push({
      title: "البريد الداخلي",
      icon: Mail,
      path: "/internal-mail",
      description: "إدارة الرسائل الداخلية والمراسلات بين الأقسام",
      notifications: notificationCounts?.internalMail || 0,
    });
  }
  
  return apps;
};
