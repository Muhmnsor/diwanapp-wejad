
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Employee {
  id: string;
  full_name: string;
  position?: string;
  department?: string;
}

interface EmployeeAssignment {
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
      
      // Transform the nested employee object to match the expected interface
      const transformedData = data.map(item => ({
        ...item,
        employee: item.employee as unknown as Employee
      }));
      
      return transformedData as EmployeeAssignment[];
    },
    enabled: !!unitId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
