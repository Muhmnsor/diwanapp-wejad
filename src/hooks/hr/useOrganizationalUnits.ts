
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface OrganizationalUnit {
  id: string;
  name: string;
  description?: string;
  unit_type: string;
  parent_id?: string;
  is_active: boolean;
}

export function useOrganizationalUnits() {
  return useQuery({
    queryKey: ["organizational-units"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organizational_units")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) {
        console.error("Error fetching organizational units:", error);
        throw error;
      }

      return data as OrganizationalUnit[];
    },
  });
}
