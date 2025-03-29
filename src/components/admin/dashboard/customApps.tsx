
import { User } from '@supabase/supabase-js';
import { BriefcaseIcon, Calculator, CalendarClock } from "lucide-react";
import { AppItem } from "./DashboardApps";

// Define our custom apps
export const HR_MANAGEMENT_APP: AppItem = {
  title: "إدارة شؤون الموظفين",
  icon: BriefcaseIcon,
  path: "/admin/hr",
  description: "إدارة المعلومات والعمليات المتعلقة بالموظفين",
  notifications: 0
};

export const ACCOUNTING_APP: AppItem = {
  title: "إدارة المحاسبة",
  icon: Calculator,
  path: "/admin/accounting",
  description: "إدارة الميزانية والشؤون المالية",
  notifications: 0
};

// Helper function to check if user has access to HR app
export const hasHRAccess = (user: User | null): boolean => {
  if (!user) return false;
  
  // Implement your access control logic here
  // This is a placeholder - replace with real logic
  return true;
};

// Helper function to check if user has access to Accounting app
export const hasAccountingAccess = (user: User | null): boolean => {
  if (!user) return false;
  
  // Implement your access control logic here
  // This is a placeholder - replace with real logic
  return true;
};

// Function to get custom apps
export const getCustomApps = (user: User | null, notificationCounts: any): AppItem[] => {
  const customApps: AppItem[] = [];
  
  if (hasHRAccess(user)) {
    customApps.push({
      ...HR_MANAGEMENT_APP,
      notifications: notificationCounts?.hr || 0
    });
  }
  
  if (hasAccountingAccess(user)) {
    customApps.push({
      ...ACCOUNTING_APP,
      notifications: notificationCounts?.accounting || 0
    });
  }
  
  return customApps;
};
