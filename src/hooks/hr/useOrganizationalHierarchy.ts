
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface OrganizationalHierarchyItem {
  id: string;
  name: string;
  description?: string;
  unit_type: string;
  parent_id?: string;
  level: number;
  path: string[];
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
      
      // Transform the data if needed
      const transformedData = data.map((item: any) => ({
        ...item,
        // Convert UUID[] to string[] if needed
        path: Array.isArray(item.path) ? item.path : []
      }));
      
      return transformedData as OrganizationalHierarchyItem[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
