import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface EmployeeStatsData {
  total: number;
  active: number;
  onLeave: number;
}

export function useEmployeeStats(unitId: string) {
  return useQuery<EmployeeStatsData, Error>({
    queryKey: ['employee-stats', unitId],
    queryFn: async () => {
      let employeeIds: string[] = [];
      
      // If unitId is not 'all', get employees from the organizational unit
      if (unitId !== 'all') {
        const { data: assignments, error: unitError } = await supabase
          .from('employee_organizational_units')
          .select('employee_id')
          .eq('organizational_unit_id', unitId);
          
        if (unitError) throw unitError;
        
        // Extract employee IDs
        employeeIds = assignments.map(a => a.employee_id);
        
        // If no employees in this unit, return empty stats
        if (employeeIds.length === 0) {
          return { total: 0, active: 0, onLeave: 0 };
        }
      }
      
      // Get all employees or filter by the extracted IDs
      const employeeQuery = supabase
        .from('employees')
        .select('id, status');
        
      if (unitId !== 'all' && employeeIds.length > 0) {
        employeeQuery.in('id', employeeIds);
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
      const employeesOnLeave = new Set(activeLeaves.map(leave => leave.employee_id));
      
      // Count employees on leave from our filtered list
      const onLeave = employees.filter(emp => employeesOnLeave.has(emp.id)).length;
      
      // Active employees are those with 'active' status minus those on leave
      const active = employees.filter(emp => emp.status === 'active').length - onLeave;
      
      return {
        total: employees.length,
        active,
        onLeave
      };
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}
