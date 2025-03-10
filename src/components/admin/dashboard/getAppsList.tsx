
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

export const getAppsList = (notificationCounts: NotificationCounts): AppItem[] => {
  return [
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
      notifications: notificationCounts.tasks
    },
    {
      title: "إدارة الأفكار",
      icon: Lightbulb,
      path: "/ideas",
      description: "إدارة وتنظيم الأفكار والمقترحات",
      notifications: notificationCounts.ideas
    },
    {
      title: "إدارة الأموال",
      icon: DollarSign,
      path: "/finance",
      description: "إدارة الميزانية والمصروفات",
      notifications: notificationCounts.finance
    },
    {
      title: "إدارة المستخدمين",
      icon: Users,
      path: "/users-management",
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
      notifications: notificationCounts.notifications
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
      path: "/developer-settings",
      description: "إعدادات وأدوات المطورين",
      notifications: 0
    }
  ];
};
