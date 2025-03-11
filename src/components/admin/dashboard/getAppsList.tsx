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
  Code
} from "lucide-react";
import { AppItem } from "@/components/admin/dashboard/DashboardApps";

export const getAppsList = (notificationCounts: any): AppItem[] => {
  return [
    {
      title: "إدارة المستخدمين",
      icon: Users,
      path: "/admin/users-management",
      description: "إدارة المستخدمين والأدوار",
      notifications: notificationCounts.userManagement || 0
    },
    {
      title: "إدارة المهام",
      icon: ListChecks,
      path: "/tasks/dashboard",
      description: "متابعة وإدارة المهام",
      notifications: notificationCounts.taskManagement || 0
    },
    {
      title: "إدارة المستندات",
      icon: Database,
      path: "/documents",
      description: "إدارة المستندات الرسمية",
      notifications: notificationCounts.documents || 0
    },
    {
      title: "إدارة الأفكار",
      icon: Lightbulb,
      path: "/ideas",
      description: "إدارة وتقييم الأفكار",
      notifications: notificationCounts.ideas || 0
    },
    {
      title: "الإدارة المالية",
      icon: DollarSign,
      path: "/finance",
      description: "إدارة الموارد المالية",
      notifications: notificationCounts.finance || 0
    },
    {
      title: "إدارة الموقع",
      icon: Globe,
      path: "/website",
      description: "إدارة محتوى الموقع",
      notifications: notificationCounts.website || 0
    },
    {
      title: "إدارة المتجر",
      icon: ShoppingCart,
      path: "/store",
      description: "إدارة المتجر الإلكتروني",
      notifications: notificationCounts.store || 0
    },
    {
      title: "إدارة الإشعارات",
      icon: Bell,
      path: "/notifications",
      description: "إدارة إشعارات النظام",
      notifications: notificationCounts.notifications || 0
    },
    {
      title: "إدارة الطلبات",
      icon: Inbox,
      path: "/requests",
      description: "إدارة الطلبات الواردة",
      notifications: notificationCounts.requests || 0
    },
    {
      title: "إعدادات المطور",
      icon: Code,
      path: "/developer/settings",
      description: "إعدادات وأدوات التطوير",
      notifications: 0
    }
  ];
};
