
// src/hooks/hr/useEmployeeStats.ts
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface EmployeeStatsData {
  total: number;
  active: number;
  onLeave: number;
}

export function useEmployeeStats(unitId: string | "all") {
  return useQuery<EmployeeStatsData, Error>({
    queryKey: ['employee-stats', unitId],
    queryFn: async () => {
      // Base query to get all employees
      const employeeQuery = supabase
        .from('employees')
        .select('id, status, department');
        
      // If a specific unit is selected (not "all"), we need to join through employee_organizational_units
      if (unitId !== "all") {
        const { data: employeesInUnit, error: unitError } = await supabase
          .from('employee_organizational_units')
          .select('employee_id')
          .eq('organizational_unit_id', unitId)
          .eq('is_active', true);
          
        if (unitError) throw unitError;
        
        if (employeesInUnit && employeesInUnit.length > 0) {
          const employeeIds = employeesInUnit.map(e => e.employee_id);
          employeeQuery.in('id', employeeIds);
        } else {
          // If no employees in this unit, return empty stats
          return { total: 0, active: 0, onLeave: 0 };
        }
      }
      
      const { data: employees, error } = await employeeQuery;
      
      if (error) throw error;
      
      // Get active leaves for today
      const today = new Date().toISOString().split('T')[0];
      const { data: activeLeaves, error: leavesError } = await supabase
        .from('hr_leave_requests')
        .select('employee_id')
        .eq('status', 'approved')
        .lte('start_date', today)
        .gte('end_date', today);
        
      if (leavesError) throw leavesError;
      
      // Create a set of employee IDs on leave
      const employeesOnLeave = new Set(activeLeaves?.map(leave => leave.employee_id) || []);
      
      // Count employees on leave from our filtered list
      const onLeave = employees?.filter(emp => employeesOnLeave.has(emp.id)).length || 0;
      
      // Active employees are those with 'active' status minus those on leave
      const active = (employees?.filter(emp => emp.status === 'active').length || 0) - onLeave;
      
      return {
        total: employees?.length || 0,
        active,
        onLeave
      };
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}
