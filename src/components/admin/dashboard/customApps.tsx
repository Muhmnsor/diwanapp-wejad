
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

export const MEETINGS_APP: AppItem = {
  title: "الاجتماعات",
  icon: CalendarClock,
  path: "/admin/meetings",
  description: "إدارة وتنظيم الاجتماعات والمحاضر",
  notifications: 0
};

// Helper function to check if user has access to HR app
export const hasHRAccess = async (user: User | null): Promise<boolean> => {
  if (!user) return false;
  
  try {
    // First, use the has_hr_access RPC function we created
    const { data: hasDirectAccess, error: accessError } = await supabase
      .rpc('has_hr_access', { user_id: user.id });
    
    if (accessError) {
      console.error('Error checking HR direct access:', accessError);
      return false;
    }
    
    if (hasDirectAccess) return true;
    
    // Check if user is admin
    const { data: isAdmin, error: adminError } = await supabase
      .rpc('is_admin', { user_id: user.id });
      
    if (adminError) {
      console.error('Error checking admin status:', adminError);
      return false;
    }
    
    if (isAdmin) return true;
    
    // Check app_permissions
    const { data: hasAppAccess, error: appError } = await supabase
      .rpc('check_user_app_access', { 
        p_user_id: user.id,
        p_app_name: 'hr'
      });
      
    if (appError) {
      console.error('Error checking HR app permissions:', appError);
      return false;
    }
    
    return !!hasAppAccess;
  } catch (error) {
    console.error('Error checking HR access:', error);
    return false;
  }
};

// Helper function to check if user has access to Accounting app
export const hasAccountingAccess = async (user: User | null): Promise<boolean> => {
  if (!user) return false;
  
  try {
    // Check if user is admin first
    const { data: isAdmin, error: adminError } = await supabase
      .rpc('is_admin', { user_id: user.id });
      
    if (adminError) {
      console.error('Error checking admin status:', adminError);
      return false;
    }
    
    if (isAdmin) return true;
    
    // Check app_permissions
    const { data: hasAppAccess, error: appError } = await supabase
      .rpc('check_user_app_access', { 
        p_user_id: user.id,
        p_app_name: 'accounting'
      });
      
    if (appError) {
      console.error('Error checking accounting app permissions:', appError);
      return false;
    }
    
    return !!hasAppAccess;
  } catch (error) {
    console.error('Error checking accounting access:', error);
    return false;
  }
};

// Helper function to check if user has access to Meetings app
export const hasMeetingsAccess = async (user: User | null): Promise<boolean> => {
  if (!user) return false;
  
  try {
    // Check if user is admin first
    const { data: isAdmin, error: adminError } = await supabase
      .rpc('is_admin', { user_id: user.id });
      
    if (adminError) {
      console.error('Error checking admin status:', adminError);
      return false;
    }
    
    if (isAdmin) return true;
    
    // Check app_permissions
    const { data: hasAppAccess, error: appError } = await supabase
      .rpc('check_user_app_access', { 
        p_user_id: user.id,
        p_app_name: 'meetings'
      });
      
    if (appError) {
      console.error('Error checking meetings app permissions:', appError);
      return false;
    }
    
    return !!hasAppAccess;
  } catch (error) {
    console.error('Error checking meetings access:', error);
    return false;
  }
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
  
  if (await hasAccountingAccess(user)) {
    customApps.push({
      ...ACCOUNTING_APP,
      notifications: notificationCounts?.accounting || 0
    });
  }
  
  if (await hasMeetingsAccess(user)) {
    customApps.push({
      ...MEETINGS_APP,
      notifications: notificationCounts?.meetings || 0
    });
  }
  
  return customApps;
};
