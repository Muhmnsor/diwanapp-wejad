
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LeaveEntitlement } from "./useLeaveEntitlements";

interface LeaveBalanceResponse {
  id?: string;
  available: number;
  total: number;
  used: number;
  leave_type?: {
    name: string;
    code: string;
  };
}

export function useLeaveBalance(employeeId?: string, leaveTypeId?: string) {
  const queryClient = useQueryClient();
  
  // Get balance for specific employee and leave type
  const { data: balance, isLoading, error } = useQuery({
    queryKey: ["leave-balance", employeeId, leaveTypeId],
    queryFn: async () => {
      if (!employeeId || !leaveTypeId) {
        return { available: 0, total: 0, used: 0 } as LeaveBalanceResponse;
      }
      
      const currentYear = new Date().getFullYear();
      
      // Check for existing entitlement
      const { data: entitlement, error: entitlementError } = await supabase
        .from("hr_leave_entitlements")
        .select(`
          id,
          total_days as total,
          used_days as used,
          remaining_days as available,
          leave_type:leave_type_id(name, code)
        `)
        .eq("employee_id", employeeId)
        .eq("leave_type_id", leaveTypeId)
        .eq("year", currentYear)
        .maybeSingle();
        
      if (entitlementError) throw entitlementError;
      
      // If no entitlement exists, get default from leave types
      if (!entitlement) {
        const { data: leaveType, error: typeError } = await supabase
          .from("hr_leave_types")
          .select("name, code, max_days_per_year, gender_eligibility")
          .eq("id", leaveTypeId)
          .single();
          
        if (typeError) throw typeError;
        
        return {
          available: leaveType?.max_days_per_year || 0,
          total: leaveType?.max_days_per_year || 0,
          used: 0,
          leave_type: { 
            name: leaveType?.name || "", 
            code: leaveType?.code || "" 
          }
        };
      }
      
      return entitlement;
    },
    enabled: !!employeeId && !!leaveTypeId
  });
  
  // Initialize leave balance for an employee
  const initializeBalance = useMutation({
    mutationFn: async ({ employeeId, leaveTypeId, year, totalDays }: { 
      employeeId: string;
      leaveTypeId: string;
      year: number;
      totalDays: number;
    }) => {
      const { data, error } = await supabase
        .from("hr_leave_entitlements")
        .insert({
          employee_id: employeeId,
          leave_type_id: leaveTypeId,
          year: year,
          total_days: totalDays,
          remaining_days: totalDays,
          used_days: 0
        })
        .select();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-balance", employeeId] });
      queryClient.invalidateQueries({ queryKey: ["leave-entitlements", employeeId] });
    }
  });
  
  // Update leave balance when a leave request is approved or rejected
  const updateBalance = useMutation({
    mutationFn: async ({ 
      entitlementId, 
      daysUsed,
      action
    }: { 
      entitlementId: string; 
      daysUsed: number;
      action: 'increase' | 'decrease';
    }) => {
      // First, get the current balance
      const { data: current, error: fetchError } = await supabase
        .from("hr_leave_entitlements")
        .select("used_days, remaining_days, total_days")
        .eq("id", entitlementId)
        .single();
        
      if (fetchError) throw fetchError;
      
      // Calculate new values
      const newUsed = action === 'increase' 
        ? (current?.used_days || 0) + daysUsed
        : Math.max(0, (current?.used_days || 0) - daysUsed);
        
      const newRemaining = (current?.total_days || 0) - newUsed;
      
      // Update the balance
      const { data, error } = await supabase
        .from("hr_leave_entitlements")
        .update({
          used_days: newUsed,
          remaining_days: newRemaining
        })
        .eq("id", entitlementId)
        .select();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-balance", employeeId] });
      queryClient.invalidateQueries({ queryKey: ["leave-entitlements", employeeId] });
    }
  });
  
  // Calculate days between two dates (inclusive)
  const calculateLeaveDays = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Add 1 to include both start and end dates
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    return diffDays;
  };

  // Check if employee has sufficient balance for a leave request
  const checkLeaveBalance = async (employeeId: string, leaveTypeId: string, startDate: string, endDate: string): Promise<{ 
    hasBalance: boolean;
    available: number;
    required: number;
    entitlementId?: string;
  }> => {
    const currentYear = new Date().getFullYear();
    
    // Get the entitlement
    const { data: entitlement, error: entitlementError } = await supabase
      .from("hr_leave_entitlements")
      .select("id, remaining_days")
      .eq("employee_id", employeeId)
      .eq("leave_type_id", leaveTypeId)
      .eq("year", currentYear)
      .maybeSingle();
      
    if (entitlementError) throw entitlementError;
    
    let availableDays = 0;
    
    // If no entitlement exists, get default from leave types
    if (!entitlement) {
      const { data: leaveType } = await supabase
        .from("hr_leave_types")
        .select("max_days_per_year")
        .eq("id", leaveTypeId)
        .single();
        
      availableDays = leaveType?.max_days_per_year || 0;
    } else {
      availableDays = entitlement.remaining_days || 0;
    }
    
    // Calculate required days
    const requiredDays = calculateLeaveDays(startDate, endDate);
    
    return {
      hasBalance: availableDays >= requiredDays,
      available: availableDays,
      required: requiredDays,
      entitlementId: entitlement?.id
    };
  };
  
  return {
    balance,
    isLoading,
    error,
    initializeBalance,
    updateBalance,
    calculateLeaveDays,
    checkLeaveBalance
  };
}
