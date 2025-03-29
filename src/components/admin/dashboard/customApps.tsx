
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
    // First, check if user is admin (admins have access to all apps)
    const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin', { 
      user_id: user.id 
    });
    
    if (isAdmin) {
      return true;
    }
    
    // Next, check specific HR role permissions
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select(`
        role_id,
        roles:role_id (
          name
        )
      `)
      .eq('user_id', user.id);
    
    if (rolesError) {
      console.error('Error checking HR roles:', rolesError);
      return false;
    }
    
    // Check if user has hr_manager role
    const hasHRRole = userRoles?.some(
      userRole => {
        // Access the name property safely after type check
        if (userRole.roles && typeof userRole.roles === 'object') {
          const roleName = userRole.roles as unknown as { name: string };
          return roleName.name === "hr_manager";
        }
        return false;
      }
    );
    
    return hasHRRole || false;
  } catch (error) {
    console.error('Error checking HR access:', error);
    return false;
  }
};

// Helper function to check if user has access to Accounting app
export const hasAccountingAccess = async (user: User | null): Promise<boolean> => {
  if (!user) return false;
  
  try {
    // First, check if user is admin (admins have access to all apps)
    const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin', { 
      user_id: user.id 
    });
    
    if (isAdmin) {
      return true;
    }
    
    // Next, check specific accounting role permissions
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select(`
        role_id,
        roles:role_id (
          name
        )
      `)
      .eq('user_id', user.id);
    
    if (rolesError) {
      console.error('Error checking accounting roles:', rolesError);
      return false;
    }
    
    // Check if user has accounting_manager role
    const hasAccountingRole = userRoles?.some(
      userRole => {
        // Access the name property safely after type check
        if (userRole.roles && typeof userRole.roles === 'object') {
          const roleName = userRole.roles as unknown as { name: string };
          return roleName.name === "accounting_manager";
        }
        return false;
      }
    );
    
    return hasAccountingRole || false;
  } catch (error) {
    console.error('Error checking accounting access:', error);
    return false;
  }
};

// Function to get custom apps
export const getCustomApps = async (user: User | null, notificationCounts: any): Promise<AppItem[]> => {
  const customApps: AppItem[] = [];
  
  // Check HR access (this now properly awaits the async function)
  if (await hasHRAccess(user)) {
    customApps.push({
      ...HR_MANAGEMENT_APP,
      notifications: notificationCounts?.hr || 0
    });
  }
  
  // Check Accounting access (now async)
  if (await hasAccountingAccess(user)) {
    customApps.push({
      ...ACCOUNTING_APP,
      notifications: notificationCounts?.accounting || 0
    });
  }
  
  return customApps;
};
