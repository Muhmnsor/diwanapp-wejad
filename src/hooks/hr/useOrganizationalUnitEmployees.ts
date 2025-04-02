
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface OrganizationalUnitEmployee {
  id: string;
  employee_id: string;
  organizational_unit_id: string;
  is_primary: boolean;
  created_at: string;
  employee: {
    id: string;
    full_name: string;
    email?: string;
    position?: string;
  };
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
          is_primary,
          created_at,
          employee:employees (
            id,
            full_name,
            email,
            position
          )
        `)
        .eq('organizational_unit_id', unitId)
        .order('created_at');
        
      if (error) {
        console.error("Error fetching organizational unit employees:", error);
        throw error;
      }
      
      return data as OrganizationalUnitEmployee[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!unitId,
  });
}
