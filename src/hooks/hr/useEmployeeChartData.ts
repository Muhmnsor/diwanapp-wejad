
// src/hooks/hr/useEmployeeChartData.ts
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

export function useEmployeeChartData(unitId: string | "all") {
  return useQuery<EmployeeChartData, Error>({
    queryKey: ['employee-chart-data', unitId],
    queryFn: async () => {
      // Base query to get all employees or employees in a specific unit
      let employeeQuery = supabase.from('employees').select('*');
      
      // If a specific unit is selected (not "all"), filter employees by unit
      if (unitId !== "all") {
        const { data: employeesInUnit, error: unitError } = await supabase
          .from('employee_organizational_units')
          .select('employee_id')
          .eq('organizational_unit_id', unitId)
          .eq('is_active', true);
          
        if (unitError) throw unitError;
        
        if (employeesInUnit && employeesInUnit.length > 0) {
          const employeeIds = employeesInUnit.map(e => e.employee_id);
          employeeQuery = employeeQuery.in('id', employeeIds);
        } else {
          // If no employees in this unit, return empty data
          return {
            departmentDistribution: [],
            contractTypeDistribution: []
          };
        }
      }
      
      const { data: employees, error } = await employeeQuery;
      
      if (error) throw error;
      
      if (!employees || employees.length === 0) {
        return {
          departmentDistribution: [],
          contractTypeDistribution: []
        };
      }
      
      // Process departments for chart data
      const departmentCounts: Record<string, number> = {};
      
      employees.forEach(emp => {
        if (!emp.department) return;
        
        departmentCounts[emp.department] = (departmentCounts[emp.department] || 0) + 1;
      });
      
      const departmentDistribution = Object.entries(departmentCounts).map(([name, value], index) => ({
        name,
        value,
        color: COLORS[index % COLORS.length]
      }));
      
      // Process contract types for chart data
      const contractCounts: Record<string, number> = {};
      
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
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}
