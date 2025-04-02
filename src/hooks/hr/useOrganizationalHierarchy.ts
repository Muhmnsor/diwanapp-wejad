
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface OrganizationalHierarchyItem {
  id: string;
  name: string;
  description?: string;
  unit_type: string;
  parent_id?: string;
  level: number;
  path: string[];
  position_type: 'standard' | 'side' | 'assistant';
}

export function useOrganizationalHierarchy() {
  return useQuery({
    queryKey: ['organizational-hierarchy'],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_organizational_hierarchy');
        
      if (error) {
        console.error("Error fetching organizational hierarchy:", error);
        throw error;
      }
      
      // We no longer need to add position_type as it's now returned by the function
      return data as OrganizationalHierarchyItem[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
