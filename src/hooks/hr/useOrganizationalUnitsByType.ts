// src/hooks/hr/useOrganizationalUnitsByType.ts
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface OrganizationalUnit {
  id: string;
  name: string;
  unit_type: string;
  parent_id?: string;
  description?: string;
  is_active?: boolean;
}

export function useOrganizationalUnitsByType(unitType?: string) {
  return useQuery({
    queryKey: ['organizational-units-by-type', unitType],
    queryFn: async () => {
      let query = supabase
        .from('organizational_units')
        .select('*')
        .eq('is_active', true);
        
      if (unitType) {
        query = query.eq('unit_type', unitType);
      }
      
      const { data, error } = await query.order('name');
        
      if (error) {
        console.error("Error fetching organizational units:", error);
        throw error;
      }
      
      return data as OrganizationalUnit[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

