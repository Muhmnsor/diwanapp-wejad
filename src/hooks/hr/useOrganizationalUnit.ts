
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { OrganizationalUnit } from "./useOrganizationalUnitsByType";

export function useOrganizationalUnit(unitId: string | "all") {
  return useQuery({
    queryKey: ['organizational-unit', unitId],
    queryFn: async () => {
      if (unitId === "all") {
        return { name: "جميع الوحدات", unitType: "all" };
      }
      
      const { data, error } = await supabase
        .from('organizational_units')
        .select('*')
        .eq('id', unitId)
        .single();
        
      if (error) {
        console.error("Error fetching organizational unit:", error);
        throw error;
      }
      
      return data as OrganizationalUnit;
    },
    enabled: unitId !== "all",
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
