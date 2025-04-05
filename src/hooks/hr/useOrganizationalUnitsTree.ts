
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { OrganizationalUnit } from "./useOrganizationalUnitsByType";

interface OrganizationalUnitWithChildren extends OrganizationalUnit {
  children?: OrganizationalUnitWithChildren[];
}

export function useOrganizationalUnitsTree() {
  return useQuery({
    queryKey: ['organizational-units-tree'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizational_units')
        .select('*')
        .eq('is_active', true)
        .order('name');
        
      if (error) {
        console.error("Error fetching organizational units:", error);
        throw error;
      }
      
      const units = data as OrganizationalUnit[];
      
      // Build the tree structure
      const tree: OrganizationalUnitWithChildren[] = [];
      const map: Record<string, OrganizationalUnitWithChildren> = {};
      
      // Initialize the map
      units.forEach(unit => {
        map[unit.id] = { ...unit, children: [] };
      });
      
      // Build the tree structure
      units.forEach(unit => {
        if (unit.parent_id && map[unit.parent_id]) {
          // If the unit has a parent, add it as a child of the parent
          if (!map[unit.parent_id].children) {
            map[unit.parent_id].children = [];
          }
          map[unit.parent_id].children!.push(map[unit.id]);
        } else {
          // If the unit doesn't have a parent, it's a root node
          tree.push(map[unit.id]);
        }
      });
      
      return { units, tree };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
