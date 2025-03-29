
import { User } from '@supabase/supabase-js';
import { BriefcaseIcon, Calculator, CalendarClock } from "lucide-react";
import { AppItem } from "./DashboardApps";
import { supabase } from "@/integrations/supabase/client";

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
export const hasHRAccess = async (user: User | null): Promise<boolean> => {
  if (!user) return false;
  
  try {
    // Use the has_hr_access RPC function we created
    const { data, error } = await supabase.rpc('has_hr_access', { user_id: user.id });
    
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

// Helper function to check if user has access to Accounting app
export const hasAccountingAccess = (user: User | null): boolean => {
  if (!user) return false;
  
  // Implement your access control logic here
  // For now, we'll return true to allow access for testing
  return true;
};

// Function to get custom apps
export const getCustomApps = async (user: User | null, notificationCounts: any): Promise<AppItem[]> => {
  const customApps: AppItem[] = [];
  
  if (await hasHRAccess(user)) {
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
