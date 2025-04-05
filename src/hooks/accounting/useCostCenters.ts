
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CostCenter {
  id: string;
  code: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export const useCostCenters = () => {
  const { data: costCenters = [], isLoading, error } = useQuery({
    queryKey: ["accounting_cost_centers"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("accounting_cost_centers")
          .select("*")
          .order("code", { ascending: true });

        if (error) {
          throw error;
        }

        return data as CostCenter[];
      } catch (error) {
        console.error("Error fetching cost centers:", error);
        throw error;
      }
    },
  });

  return { costCenters, isLoading, error };
};
