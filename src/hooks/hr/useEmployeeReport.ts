
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export interface EmployeeData {
  id: string;
  full_name: string;
  department: string | null;
  position: string | null;
  hire_date: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  contract_type: string | null;
  employee_number: string | null;
}

export interface EmployeeReportData {
  employees: EmployeeData[];
  stats: {
    totalEmployees: number;
    activeCount: number;
    departmentCount: number;
    positionCount: number;
    byDepartment?: { name: string; count: number }[];
    byPosition?: { name: string; count: number }[];
    byContractType?: { name: string; count: number }[];
  };
}

export function useEmployeeReport(startDate?: Date, endDate?: Date) {
  return useQuery<EmployeeReportData, Error>({
    queryKey: ['employee-report', startDate?.toISOString(), endDate?.toISOString()],
    queryFn: async () => {
      // For employees, we'll primarily use the hire_date for filtering if provided
      let query = supabase
        .from('employees')
        .select('*')
        .order('full_name');
      
      if (startDate) {
        query = query.gte('hire_date', startDate.toISOString().split('T')[0]);
      }
      
      // We don't typically filter by end date for employees unless looking for specific hire period
      if (startDate && endDate) {
        query = query.lte('hire_date', endDate.toISOString().split('T')[0]);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Process the data for statistics
      const employees = data || [];
      const totalEmployees = employees.length;
      const activeCount = employees.filter(emp => emp.status === 'active').length;
      
      // Count unique departments
      const departments = new Set();
      const departmentCounts = new Map();
      
      // Count unique positions
      const positions = new Set();
      const positionCounts = new Map();
      
      // Count contract types
      const contractTypes = new Map();
      
      employees.forEach(emp => {
        // Process departments
        if (emp.department) {
          departments.add(emp.department);
          
          if (!departmentCounts.has(emp.department)) {
            departmentCounts.set(emp.department, 0);
          }
          departmentCounts.set(emp.department, departmentCounts.get(emp.department) + 1);
        }
        
        // Process positions
        if (emp.position) {
          positions.add(emp.position);
          
          if (!positionCounts.has(emp.position)) {
            positionCounts.set(emp.position, 0);
          }
          positionCounts.set(emp.position, positionCounts.get(emp.position) + 1);
        }
        
        // Process contract types
        const contractType = emp.contract_type || 'غير محدد';
        if (!contractTypes.has(contractType)) {
          contractTypes.set(contractType, 0);
        }
        contractTypes.set(contractType, contractTypes.get(contractType) + 1);
      });
      
      // Convert maps to arrays for stats
      const byDepartment = Array.from(departmentCounts.entries()).map(([name, count]) => ({
        name,
        count: count as number
      }));
      
      const byPosition = Array.from(positionCounts.entries()).map(([name, count]) => ({
        name,
        count: count as number
      }));
      
      const byContractType = Array.from(contractTypes.entries()).map(([name, count]) => ({
        name,
        count: count as number
      }));
      
      return {
        employees: data || [],
        stats: {
          totalEmployees,
          activeCount,
          departmentCount: departments.size,
          positionCount: positions.size,
          byDepartment,
          byPosition,
          byContractType
        }
      };
    }
  });
}
