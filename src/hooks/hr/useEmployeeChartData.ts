import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface ChartData {
  name: string;
  value: number;
  color: string;
}

interface EmployeeChartData {
  departmentDistribution: ChartData[];
  contractTypeDistribution: ChartData[];
}

const COLORS = ['#4ade80', '#facc15', '#f87171', '#60a5fa', '#c084fc', '#fb923c'];

export function useEmployeeChartData(unitId: string) {
  return useQuery<EmployeeChartData, Error>({
    queryKey: ['employee-chart-data', unitId],
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
        
        // If no employees in this unit, return empty data
        if (employeeIds.length === 0) {
          return {
            departmentDistribution: [],
            contractTypeDistribution: []
          };
        }
      }
      
      // Get all employees or filter by extracted IDs
      const employeeQuery = supabase.from('employees').select('*');
      
      if (unitId !== 'all' && employeeIds.length > 0) {
        employeeQuery.in('id', employeeIds);
      }
      
      const { data: employees, error } = await employeeQuery;
      
      if (error) throw error;
      
      // 1. Get all departments for organization chart
      let departmentDistribution: ChartData[] = [];
      
      if (unitId === 'all') {
        // For "all" view, get departments from organizational_units
        const { data: departments, error: deptError } = await supabase
          .from('organizational_units')
          .select(`
            id, 
            name,
            employee_organizational_units!inner(employee_id)
          `)
          .eq('unit_type', 'department')
          .eq('is_active', true);
        
        if (deptError) throw deptError;
        
        // Count employee assignments per department
        const departmentCounts: Record<string, number> = {};
        
        departments.forEach(dept => {
          if (dept.employee_organizational_units) {
            departmentCounts[dept.name] = dept.employee_organizational_units.length;
          }
        });
        
        // Convert to chart format
        departmentDistribution = Object.entries(departmentCounts)
          .filter(([_, count]) => count > 0) // Filter out departments with no employees
          .map(([name, value], index) => ({
            name,
            value,
            color: COLORS[index % COLORS.length]
          }));
      }
      
      // 2. Contract type distribution
      const contractCounts: Record<string, number> = {};
      
      // Collect all contract types
      employees.forEach(emp => {
        if (!emp.contract_type) return;
        
        let contractType = emp.contract_type;
        // Translate contract types
        switch (contractType) {
          case 'full_time': contractType = 'دوام كامل'; break;
          case 'part_time': contractType = 'دوام جزئي'; break;
          case 'contract': contractType = 'تعاقد'; break;
        }
        
        contractCounts[contractType] = (contractCounts[contractType] || 0) + 1;
      });
      
      // Convert to chart format
      const contractTypeDistribution = Object.entries(contractCounts).map(([name, value], index) => ({
        name,
        value,
        color: COLORS[index % COLORS.length]
      }));
      
      return {
        departmentDistribution,
        contractTypeDistribution
      };
    },
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });
}
