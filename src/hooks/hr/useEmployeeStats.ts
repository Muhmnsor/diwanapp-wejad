// src/hooks/hr/useEmployeeStats.ts
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface EmployeeStatsData {
  total: number;
  active: number;
  onLeave: number;
}

export function useEmployeeStats(department: "all" | "engineering" | "marketing" | "hr") {
  return useQuery<EmployeeStatsData, Error>({
    queryKey: ['employee-stats', department],
    queryFn: async () => {
      // Get all employees or filter by department
      const employeeQuery = supabase
        .from('employees')
        .select('id, status, department');
        
      if (department !== "all") {
        let deptName;
        switch (department) {
          case "engineering": deptName = "الهندسة"; break;
          case "marketing": deptName = "التسويق"; break;
          case "hr": deptName = "الموارد البشرية"; break;
        }
        employeeQuery.eq('department', deptName);
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

