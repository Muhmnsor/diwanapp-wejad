
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
import { supabase } from "@/integrations/supabase/client";

export const getAppsList = async (notificationCounts: any, user: any): Promise<AppItem[]> => {
  const apps: AppItem[] = [];
  
  // Check user access to HR app
  const { data: hasHRAccess } = await supabase.rpc('check_user_app_access', {
    p_user_id: user.id,
    p_app_name: 'hr'
  });
  
  if (hasHRAccess) {
    apps.push({
      title: "الموارد البشرية",
      icon: Users,
      path: "/admin/hr",
      description: "إدارة شؤون الموظفين والحضور والإجازات",
      notifications: notificationCounts?.hr || 0,
    });
  }
  
  // Check user access to accounting app
  const { data: hasAccountingAccess } = await supabase.rpc('check_user_app_access', {
    p_user_id: user.id,
    p_app_name: 'accounting'
  });
  
  if (hasAccountingAccess) {
    apps.push({
      title: "المحاسبة",
      icon: DollarSign,
      path: "/admin/accounting",
      description: "إدارة الشؤون المالية والميزانيات والمصروفات",
      notifications: notificationCounts?.accounting || 0,
    });
  }
  
  // Check user access to website app
  const { data: hasWebsiteAccess } = await supabase.rpc('check_user_app_access', {
    p_user_id: user.id,
    p_app_name: 'website'
  });
  
  if (hasWebsiteAccess) {
    apps.push({
      title: "الموقع الإلكتروني",
      icon: Globe,
      path: "/website",
      description: "إدارة محتوى الموقع الإلكتروني والصفحات",
      notifications: notificationCounts?.website || 0,
    });
  }
  
  // Check user access to store app
  const { data: hasStoreAccess } = await supabase.rpc('check_user_app_access', {
    p_user_id: user.id,
    p_app_name: 'store'
  });
  
  if (hasStoreAccess) {
    apps.push({
      title: "المتجر الإلكتروني",
      icon: ShoppingCart,
      path: "/store",
      description: "إدارة المتجر وعرض المنتجات والطلبات",
      notifications: notificationCounts?.store || 0,
    });
  }
  
  // Check user access to tasks app
  const { data: hasTasksAccess } = await supabase.rpc('check_user_app_access', {
    p_user_id: user.id,
    p_app_name: 'tasks'
  });
  
  if (hasTasksAccess) {
    apps.push({
      title: "المهام",
      icon: ListChecks,
      path: "/tasks",
      description: "إدارة المهام ومتابعة الإنجاز والتقارير",
      notifications: notificationCounts?.tasks || 0,
    });
  }
  
  // Check user access to documents app
  const { data: hasDocumentsAccess } = await supabase.rpc('check_user_app_access', {
    p_user_id: user.id,
    p_app_name: 'documents'
  });
  
  if (hasDocumentsAccess) {
    apps.push({
      title: "المستندات",
      icon: Database,
      path: "/documents",
      description: "إدارة المستندات والملفات المشتركة",
      notifications: notificationCounts?.documents || 0,
    });
  }
  
  // Check user access to ideas app
  const { data: hasIdeasAccess } = await supabase.rpc('check_user_app_access', {
    p_user_id: user.id,
    p_app_name: 'ideas'
  });
  
  if (hasIdeasAccess) {
    apps.push({
      title: "الأفكار والمبادرات",
      icon: Lightbulb,
      path: "/ideas",
      description: "إدارة الأفكار والمبادرات ومتابعتها",
      notifications: notificationCounts?.ideas || 0,
    });
  }
  
  // Check user access to notifications app
  const { data: hasNotificationsAccess } = await supabase.rpc('check_user_app_access', {
    p_user_id: user.id,
    p_app_name: 'notifications'
  });
  
  if (hasNotificationsAccess) {
    apps.push({
      title: "الإشعارات",
      icon: Bell,
      path: "/notifications",
      description: "إدارة إشعارات التطبيق وسجل الرسائل",
      notifications: notificationCounts?.notificationSystem || 0,
    });
  }

  // Check user access to internal mail app
  const { data: hasInternalMailAccess } = await supabase.rpc('check_user_app_access', {
    p_user_id: user.id,
    p_app_name: 'internal_mail'
  });
  
  if (hasInternalMailAccess) {
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
