
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface OrganizationalUnit {
  id: string;
  name: string;
  description?: string;
  unit_type: string;
  parent_id?: string;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export function useOrganizationalUnits() {
  return useQuery({
    queryKey: ['organizational-units'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizational_units')
        .select('*')
        .order('name');
        
      if (error) {
        console.error("Error fetching organizational units:", error);
        throw error;
      }
      
      return data as OrganizationalUnit[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
