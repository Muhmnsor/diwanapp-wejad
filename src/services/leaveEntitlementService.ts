
import { supabase } from "@/integrations/supabase/client";

// Initialize leave entitlements for a new employee
export async function initializeEmployeeEntitlements(employeeId: string) {
  try {
    const currentYear = new Date().getFullYear();
    
    // First get all active leave types
    const { data: leaveTypes, error: typeError } = await supabase
      .from("hr_leave_types")
      .select("*")
      .eq("is_active", true);
      
    if (typeError) throw typeError;
    
    if (!leaveTypes || leaveTypes.length === 0) {
      return { success: false, message: "لا توجد أنواع إجازات نشطة" };
    }
    
    // Get employee details for gender check
    const { data: employee, error: employeeError } = await supabase
      .from("employees")
      .select("gender")
      .eq("id", employeeId)
      .single();
      
    if (employeeError) throw employeeError;
    
    // Create entitlements for each applicable leave type
    const entitlements = leaveTypes
      .filter(leaveType => {
        // Skip if gender-specific and doesn't match employee's gender
        if (leaveType.gender_eligibility === 'male' && employee?.gender !== 'ذكر') {
          return false;
        }
        if (leaveType.gender_eligibility === 'female' && employee?.gender !== 'أنثى') {
          return false;
        }
        return true;
      })
      .map(leaveType => ({
        employee_id: employeeId,
        leave_type_id: leaveType.id,
        year: currentYear,
        total_days: leaveType.max_days_per_year || 0,
        remaining_days: leaveType.max_days_per_year || 0,
        used_days: 0
      }));
    
    // Insert the entitlements
    if (entitlements.length > 0) {
      const { error: insertError } = await supabase
        .from("hr_leave_entitlements")
        .upsert(entitlements, { onConflict: 'employee_id,leave_type_id,year' });
        
      if (insertError) throw insertError;
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error initializing leave entitlements:", error);
    return { success: false, error };
  }
}

// Get or create an entitlement for a specific employee and leave type
export async function getOrCreateEntitlement(employeeId: string, leaveTypeId: string) {
  try {
    const currentYear = new Date().getFullYear();
    
    // Check if entitlement exists
    const { data: existingEntitlement, error: checkError } = await supabase
      .from("hr_leave_entitlements")
      .select("*")
      .eq("employee_id", employeeId)
      .eq("leave_type_id", leaveTypeId)
      .eq("year", currentYear)
      .maybeSingle();
      
    if (checkError) throw checkError;
    
    // If entitlement exists, return it
    if (existingEntitlement) {
      return { success: true, entitlement: existingEntitlement };
    }
    
    // If not, get leave type details
    const { data: leaveType, error: typeError } = await supabase
      .from("hr_leave_types")
      .select("*")
      .eq("id", leaveTypeId)
      .single();
      
    if (typeError) throw typeError;
    
    // Create new entitlement
    const newEntitlement = {
      employee_id: employeeId,
      leave_type_id: leaveTypeId,
      year: currentYear,
      total_days: leaveType.max_days_per_year || 0,
      remaining_days: leaveType.max_days_per_year || 0,
      used_days: 0
    };
    
    const { data: createdEntitlement, error: createError } = await supabase
      .from("hr_leave_entitlements")
      .insert(newEntitlement)
      .select()
      .single();
      
    if (createError) throw createError;
    
    return { success: true, entitlement: createdEntitlement };
  } catch (error) {
    console.error("Error getting/creating entitlement:", error);
    return { success: false, error };
  }
}

// Update leave balance when a request is approved or rejected
export async function updateLeaveBalance(
  employeeId: string, 
  leaveTypeId: string, 
  startDate: string, 
  endDate: string, 
  action: 'increase' | 'decrease'
) {
  try {
    const currentYear = new Date().getFullYear();
    
    // Calculate days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    const daysCount = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    // Get or create entitlement
    const { success, entitlement, error } = await getOrCreateEntitlement(employeeId, leaveTypeId);
    
    if (!success || !entitlement) {
      throw error || new Error("فشل في الحصول على رصيد الإجازة");
    }
    
    // Calculate new values
    let newUsed = entitlement.used_days || 0;
    if (action === 'increase') {
      newUsed += daysCount;
    } else {
      newUsed = Math.max(0, newUsed - daysCount);
    }
    
    const newRemaining = (entitlement.total_days || 0) - newUsed;
    
    // Update the record
    const { data, error: updateError } = await supabase
      .from("hr_leave_entitlements")
      .update({
        used_days: newUsed,
        remaining_days: newRemaining
      })
      .eq("id", entitlement.id)
      .select();
      
    if (updateError) throw updateError;
    
    return { success: true, data };
  } catch (error) {
    console.error("Error updating leave balance:", error);
    return { success: false, error };
  }
}
