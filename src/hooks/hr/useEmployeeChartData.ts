
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

export function useEmployeeChartData(department: string = "all") {
  return useQuery<EmployeeChartData, Error>({
    queryKey: ['employee-chart-data', department],
    queryFn: async () => {
      // 1. Get organizational units (departments)
      const { data: orgUnits, error: orgUnitsError } = await supabase
        .from('organizational_units')
        .select('id, name, type, unit_type');
      
      if (orgUnitsError) throw orgUnitsError;
      
      // Filter for department-type units only
      const departments = orgUnits.filter(unit => 
        unit.unit_type === 'department' || 
        unit.type === 'department' || 
        unit.unit_type === 'قسم' || 
        unit.type === 'قسم'
      );
      
      // 2. Get employee-department assignments
      let query = supabase
        .from('employee_organizational_units')
        .select(`
          id,
          employee_id,
          organizational_unit_id,
          is_primary,
          employee:employees(id, full_name, contract_type)
        `)
        .eq('is_primary', true);
      
      // If specific department is selected, filter by that department
      if (department !== "all") {
        // Find the department ID by name
        const selectedDept = departments.find(dept => dept.name === department);
        if (selectedDept) {
          query = query.eq('organizational_unit_id', selectedDept.id);
        }
      }
      
      const { data: assignments, error: assignmentsError } = await query;
      
      if (assignmentsError) throw assignmentsError;
      
      // 3. Create department distribution data
      const departmentCounts: Record<string, number> = {};
      
      // Initialize all departments with zero count
      departments.forEach(dept => {
        departmentCounts[dept.name] = 0;
      });
      
      // Count employees per department
      assignments.forEach(assignment => {
        // Skip if missing department or employee data
        if (!assignment.organizational_unit_id || 
            !assignment.employee || 
            !assignment.employee[0]) return;
        
        // Find the department name
        const dept = departments.find(d => d.id === assignment.organizational_unit_id);
        if (dept) {
          departmentCounts[dept.name] = (departmentCounts[dept.name] || 0) + 1;
        }
      });
      
      // Format for chart
      const departmentDistribution = Object.entries(departmentCounts)
        .filter(([_, count]) => count > 0) // Only include departments with employees
        .map(([name, value], index) => ({
          name,
          value,
          color: COLORS[index % COLORS.length]
        }));
      
      // 4. Contract type distribution
      const contractCounts: Record<string, number> = {};
      
      // Count contract types
      assignments.forEach(assignment => {
        if (!assignment.employee || 
            !assignment.employee[0]?.contract_type) return;
        
        let contractType = assignment.employee[0].contract_type;
        // Translate contract types
        switch (contractType) {
          case 'full_time': contractType = 'دوام كامل'; break;
          case 'part_time': contractType = 'دوام جزئي'; break;
          case 'contract': contractType = 'تعاقد'; break;
          case 'temporary': contractType = 'مؤقت'; break;
          case 'probation': contractType = 'تجريبي'; break;
        }
        
        contractCounts[contractType] = (contractCounts[contractType] || 0) + 1;
      });
      
      // Format for chart
      const contractTypeDistribution = Object.entries(contractCounts)
        .map(([name, value], index) => ({
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
