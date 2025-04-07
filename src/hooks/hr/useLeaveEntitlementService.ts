
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useLeaveEntitlementService() {
  const queryClient = useQueryClient();

  // Initialize a new leave entitlement for an employee
  const initializeEntitlement = useMutation({
    mutationFn: async ({ 
      employeeId, 
      leaveTypeId, 
      year, 
      entitledDays 
    }: { 
      employeeId: string;
      leaveTypeId: string;
      year?: number;
      entitledDays?: number;
    }) => {
      // Default to current year if not provided
      const entitlementYear = year || new Date().getFullYear();
      
      // First, check if this entitlement already exists
      const { data: existing, error: checkError } = await supabase
        .from("hr_leave_entitlements")
        .select("*")
        .eq("employee_id", employeeId)
        .eq("leave_type_id", leaveTypeId)
        .eq("year", entitlementYear)
        .maybeSingle();
        
      if (checkError) throw checkError;
      
      // If it already exists, don't create a new one
      if (existing) {
        return existing;
      }
      
      // If entitled days not provided, get default from leave type
      let days = entitledDays;
      if (days === undefined) {
        const { data: leaveType, error: typeError } = await supabase
          .from("hr_leave_types")
          .select("max_days")
          .eq("id", leaveTypeId)
          .single();
          
        if (typeError) throw typeError;
        days = leaveType.max_days || 0;
      }
      
      // Create the new entitlement
      const { data, error } = await supabase
        .from("hr_leave_entitlements")
        .insert({
          employee_id: employeeId,
          leave_type_id: leaveTypeId,
          year: entitlementYear,
          entitled_days: days,
          used_days: 0,
          remaining_days: days
        })
        .select()
        .single();
        
      if (error) throw error;
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-entitlements"] });
      queryClient.invalidateQueries({ queryKey: ["leave-balance"] });
    },
    onError: (error) => {
      console.error("Error initializing leave entitlement:", error);
      toast.error("تعذر تهيئة رصيد الإجازة");
    }
  });

  // Initialize entitlements for all leave types for an employee
  const initializeAllEntitlements = useMutation({
    mutationFn: async ({ 
      employeeId, 
      year 
    }: { 
      employeeId: string;
      year?: number;
    }) => {
      const entitlementYear = year || new Date().getFullYear();
      
      // Get all active leave types
      const { data: leaveTypes, error: typesError } = await supabase
        .from("hr_leave_types")
        .select("*")
        .eq("is_active", true);
        
      if (typesError) throw typesError;
      
      // For each leave type, initialize an entitlement
      const results = [];
      for (const leaveType of leaveTypes) {
        // Check if entitlement already exists
        const { data: existing, error: checkError } = await supabase
          .from("hr_leave_entitlements")
          .select("*")
          .eq("employee_id", employeeId)
          .eq("leave_type_id", leaveType.id)
          .eq("year", entitlementYear)
          .maybeSingle();
          
        if (checkError) throw checkError;
        
        // If it doesn't exist, create it
        if (!existing) {
          const { data, error } = await supabase
            .from("hr_leave_entitlements")
            .insert({
              employee_id: employeeId,
              leave_type_id: leaveType.id,
              year: entitlementYear,
              entitled_days: leaveType.max_days || 0,
              used_days: 0,
              remaining_days: leaveType.max_days || 0
            })
            .select()
            .single();
            
          if (error) throw error;
          
          results.push(data);
        } else {
          results.push(existing);
        }
      }
      
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-entitlements"] });
      queryClient.invalidateQueries({ queryKey: ["leave-balance"] });
    },
    onError: (error) => {
      console.error("Error initializing all leave entitlements:", error);
      toast.error("تعذر تهيئة أرصدة الإجازات");
    }
  });

  // Update leave balance when a leave request is approved or rejected
  const updateLeaveBalance = useMutation({
    mutationFn: async ({ 
      employeeId, 
      leaveTypeId, 
      days, 
      isApproval 
    }: { 
      employeeId: string;
      leaveTypeId: string;
      days: number;
      isApproval: boolean;
    }) => {
      // Get current year
      const currentYear = new Date().getFullYear();
      
      // Get the current entitlement
      const { data: entitlement, error: getError } = await supabase
        .from("hr_leave_entitlements")
        .select("*")
        .eq("employee_id", employeeId)
        .eq("leave_type_id", leaveTypeId)
        .eq("year", currentYear)
        .maybeSingle();
        
      if (getError) throw getError;
      
      // If no entitlement exists, initialize one and then update it
      if (!entitlement) {
        // Get default days from leave type
        const { data: leaveType, error: typeError } = await supabase
          .from("hr_leave_types")
          .select("max_days")
          .eq("id", leaveTypeId)
          .single();
          
        if (typeError) throw typeError;
        
        const defaultDays = leaveType.max_days || 0;
        
        // Create new entitlement
        const { data: newEntitlement, error: createError } = await supabase
          .from("hr_leave_entitlements")
          .insert({
            employee_id: employeeId,
            leave_type_id: leaveTypeId,
            year: currentYear,
            entitled_days: defaultDays,
            used_days: isApproval ? days : 0,
            remaining_days: isApproval ? defaultDays - days : defaultDays
          })
          .select()
          .single();
          
        if (createError) throw createError;
        
        return newEntitlement;
      } 
      
      // If entitlement exists, update it
      const updatedUsedDays = isApproval 
        ? entitlement.used_days + days
        : entitlement.used_days;
        
      const updatedRemainingDays = entitlement.entitled_days - updatedUsedDays;
      
      const { data, error } = await supabase
        .from("hr_leave_entitlements")
        .update({
          used_days: updatedUsedDays,
          remaining_days: updatedRemainingDays
        })
        .eq("id", entitlement.id)
        .select()
        .single();
        
      if (error) throw error;
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-entitlements"] });
      queryClient.invalidateQueries({ queryKey: ["leave-balance"] });
    },
    onError: (error) => {
      console.error("Error updating leave balance:", error);
      toast.error("تعذر تحديث رصيد الإجازة");
    }
  });

  return {
    initializeEntitlement,
    initializeAllEntitlements,
    updateLeaveBalance
  };
}
