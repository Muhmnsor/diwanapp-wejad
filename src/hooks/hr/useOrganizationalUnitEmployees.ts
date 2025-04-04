
// src/hooks/hr/useOrganizationalUnitEmployees.ts
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Employee {
  id: string;
  full_name: string;
  position?: string;
  department?: string;
}

export interface EmployeeAssignment {
  id: string;
  employee_id: string;
  organizational_unit_id: string;
  role?: string;
  is_primary: boolean;
  start_date?: string;
  end_date?: string;
  employee: Employee;
}

export function useOrganizationalUnitEmployees(unitId: string) {
  return useQuery({
    queryKey: ['organizational-unit-employees', unitId],
    queryFn: async () => {
      if (!unitId) return [];
      
      const { data, error } = await supabase
        .from('employee_organizational_units')
        .select(`
          id,
          employee_id,
          organizational_unit_id,
          role,
          is_primary,
          start_date,
          end_date,
          employee:employees(id, full_name, position, department)
        `)
        .eq('organizational_unit_id', unitId);
        
      if (error) {
        console.error("Error fetching unit employees:", error);
        throw error;
      }
      
      // Transform data to match EmployeeAssignment[] type
      const transformedData = data.map(item => {
        return {
          id: item.id,
          employee_id: item.employee_id,
          organizational_unit_id: item.organizational_unit_id,
          role: item.role,
          is_primary: item.is_primary,
          start_date: item.start_date,
          end_date: item.end_date,
          // Extract employee from array
          employee: item.employee && item.employee[0] ? {
            id: item.employee[0].id,
            full_name: item.employee[0].full_name,
            position: item.employee[0].position,
            department: item.employee[0].department
          } : {
            id: '',
            full_name: 'Unknown Employee'
          }
        } as EmployeeAssignment;
      });
      
      return transformedData as EmployeeAssignment[];
    },
    enabled: !!unitId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
