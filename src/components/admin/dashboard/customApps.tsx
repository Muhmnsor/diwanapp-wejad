
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
    // Check if user is admin/developer first, they should have access to all apps
    const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin', { user_id: user.id });
    
    if (adminError) {
      console.error('Error checking admin status:', adminError);
    } else if (isAdmin) {
      console.log('User is admin, granting HR access');
      return true;
    }
    
    // If not admin, check specific HR access
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
export const hasAccountingAccess = async (user: User | null): Promise<boolean> => {
  if (!user) return false;
  
  try {
    // Check if user is admin/developer first, they should have access to all apps
    const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin', { user_id: user.id });
    
    if (adminError) {
      console.error('Error checking admin status:', adminError);
    } else if (isAdmin) {
      console.log('User is admin, granting Accounting access');
      return true;
    }
    
    // For now, we'll return true to allow access for testing
    // Later this can be replaced with a specific check like for HR
    return true;
  } catch (error) {
    console.error('Error checking Accounting access:', error);
    return false;
  }
};

// Function to get custom apps
export const getCustomApps = async (user: User | null, notificationCounts: any): Promise<AppItem[]> => {
  const customApps: AppItem[] = [];
  
  // Check HR access
  const hrAccess = await hasHRAccess(user);
  console.log('User has HR access:', hrAccess);
  
  if (hrAccess) {
    customApps.push({
      ...HR_MANAGEMENT_APP,
      notifications: notificationCounts?.hr || 0
    });
  }
  
  // Check Accounting access
  const accountingAccess = await hasAccountingAccess(user);
  console.log('User has Accounting access:', accountingAccess);
  
  if (accountingAccess) {
    customApps.push({
      ...ACCOUNTING_APP,
      notifications: notificationCounts?.accounting || 0
    });
  }
  
  return customApps;
};
