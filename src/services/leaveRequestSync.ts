
import { supabase } from "@/integrations/supabase/client";

export interface LeaveRequestSyncData {
  requestId: string;
  status: string;
  employeeId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason?: string;
}

export async function syncLeaveRequestToHR(data: LeaveRequestSyncData) {
  try {
    // Check if this request has already been synced
    const { data: existingData, error: checkError } = await supabase
      .from('hr_leave_requests')
      .select('id')
      .eq('request_id', data.requestId)
      .maybeSingle();
      
    if (checkError) throw checkError;
    
    if (existingData) {
      // Update existing leave request
      const { error: updateError } = await supabase
        .from('hr_leave_requests')
        .update({
          status: data.status,
          start_date: data.startDate,
          end_date: data.endDate,
          leave_type: data.leaveType,
          reason: data.reason
        })
        .eq('id', existingData.id);
        
      if (updateError) throw updateError;
      
      return existingData.id;
    } else {
      // Create new leave request
      const { data: insertData, error: insertError } = await supabase
        .from('hr_leave_requests')
        .insert({
          request_id: data.requestId,
          employee_id: data.employeeId,
          leave_type: data.leaveType,
          start_date: data.startDate,
          end_date: data.endDate,
          reason: data.reason,
          status: data.status
        })
        .select()
        .single();
        
      if (insertError) throw insertError;
      
      return insertData.id;
    }
  } catch (error) {
    console.error('Error syncing leave request to HR:', error);
    throw error;
  }
}

export async function updateLeaveEntitlements(employeeId: string, leaveType: string, days: number) {
  try {
    const year = new Date().getFullYear();
    
    // Get leave type ID
    const { data: leaveTypeData, error: leaveTypeError } = await supabase
      .from('hr_leave_types')
      .select('id')
      .eq('name', leaveType)
      .single();
      
    if (leaveTypeError) throw leaveTypeError;
    
    // Get current entitlement
    const { data: entitlementData, error: entitlementError } = await supabase
      .from('hr_leave_entitlements')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('leave_type_id', leaveTypeData.id)
      .eq('year', year)
      .maybeSingle();
      
    if (entitlementError) throw entitlementError;
    
    if (entitlementData) {
      // Update existing entitlement
      const { error: updateError } = await supabase
        .from('hr_leave_entitlements')
        .update({
          used_days: entitlementData.used_days + days,
          remaining_days: entitlementData.total_days - (entitlementData.used_days + days)
        })
        .eq('id', entitlementData.id);
        
      if (updateError) throw updateError;
    } else {
      // Get default leave days
      const { data: leaveTypeDetails, error: detailsError } = await supabase
        .from('hr_leave_types')
        .select('max_days_per_year')
        .eq('id', leaveTypeData.id)
        .single();
        
      if (detailsError) throw detailsError;
      
      // Create new entitlement
      const totalDays = leaveTypeDetails.max_days_per_year || 0;
      const { error: insertError } = await supabase
        .from('hr_leave_entitlements')
        .insert({
          employee_id: employeeId,
          leave_type_id: leaveTypeData.id,
          year: year,
          total_days: totalDays,
          used_days: days,
          remaining_days: totalDays - days
        });
        
      if (insertError) throw insertError;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating leave entitlements:', error);
    throw error;
  }
}
