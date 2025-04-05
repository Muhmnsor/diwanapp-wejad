
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface OrganizationalUnit {
  id: string;
  name: string;
  description?: string;
  unit_type: string;
  parent_id?: string;
  is_active?: boolean;
}

export function useOrganizationalUnitsByType(unitType?: string) {
  return useQuery({
    queryKey: ['organizational-units', unitType],
    queryFn: async () => {
      const query = supabase
        .from('organizational_units')
        .select('*')
        .eq('is_active', true)
        .order('name');
        
      // If a specific unit type is requested, filter by that type
      if (unitType) {
        query.eq('unit_type', unitType);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching organizational units:", error);
        throw error;
      }
      
      return data as OrganizationalUnit[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
