
import { Database, ListChecks, Lightbulb, DollarSign, Globe, ShoppingCart, Users, Bell, CalendarClock, Inbox } from "lucide-react";
import { AppItem } from "./DashboardApps";

// Define all available apps
export const ALL_APPS: AppItem[] = [
  {
    title: "إدارة المستندات",
    icon: Database,
    path: "/documents",
    description: "إنشاء وإدارة المستندات والملفات",
    notifications: 0,
  },
  {
    title: "نظام المهام",
    icon: ListChecks,
    path: "/tasks",
    description: "إدارة المهام والمشاريع",
    notifications: 0,
  },
  {
    title: "نظام الأفكار",
    icon: Lightbulb,
    path: "/ideas",
    description: "إدارة واقتراح الأفكار الجديدة",
    notifications: 0,
  },
  {
    title: "الإدارة المالية",
    icon: DollarSign,
    path: "/finance",
    description: "إدارة الموارد المالية والمصاريف",
    notifications: 0,
  },
  {
    title: "إدارة الموقع",
    icon: Globe,
    path: "/website",
    description: "إدارة محتوى الموقع الإلكتروني",
    notifications: 0,
  },
  {
    title: "إدارة المتجر",
    icon: ShoppingCart,
    path: "/store",
    description: "إدارة المنتجات والمبيعات",
    notifications: 0,
  },
  {
    title: "إدارة المستخدمين",
    icon: Users,
    path: "/admin/users-management",
    description: "إدارة حسابات المستخدمين والصلاحيات",
    notifications: 0,
  },
  {
    title: "الإشعارات",
    icon: Bell,
    path: "/notifications",
    description: "إدارة إشعارات النظام",
    notifications: 0,
  },
  {
    title: "نظام الطلبات",
    icon: ListChecks,
    path: "/requests",
    description: "إدارة طلبات المستخدمين",
    notifications: 0,
  },
  {
    title: "إدارة الاجتماعات",
    icon: CalendarClock,
    path: "/admin/meetings",
    description: "إدارة جدول الاجتماعات والمشاركين والمحاضر",
    notifications: 0,
  },
  {
    title: "البريد الداخلي",
    icon: Inbox,
    path: "/internal-mail",
    description: "إدارة الرسائل الداخلية بين أعضاء الفريق",
    notifications: 0,
  },
];

// Function to get apps based on user role and notification counts
export const getAppsList = async (notificationCounts: any, user: any) => {
  try {
    console.log("Getting apps list for user:", user?.id);
    
    // Create a deep copy of the apps array to avoid modifying the original
    const apps = JSON.parse(JSON.stringify(ALL_APPS));
    
    // Update notifications count from the provided data
    apps.forEach((app: AppItem) => {
      if (app.path === "/notifications" && notificationCounts?.notifications) {
        app.notifications = notificationCounts.notifications;
      } else if (app.path === "/requests" && notificationCounts?.requests) {
        app.notifications = notificationCounts.requests;
      } else if (app.path === "/admin/meetings" && notificationCounts?.meetings) {
        app.notifications = notificationCounts.meetings;
      } else if (app.path === "/internal-mail" && notificationCounts?.internalMail) {
        app.notifications = notificationCounts.internalMail;
      }
    });
    
    return apps;
  } catch (error) {
    console.error("Error in getAppsList:", error);
    return [];
  }
};
