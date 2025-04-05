
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AccountingPeriod {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_closed: boolean;
  created_at: string;
  updated_at: string;
}

export const useAccountingPeriods = () => {
  const { data: periods = [], isLoading, error } = useQuery({
    queryKey: ["accounting_periods"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("accounting_periods")
          .select("*")
          .order("start_date", { ascending: false });

        if (error) {
          throw error;
        }

        return data as AccountingPeriod[];
      } catch (error) {
        console.error("Error fetching accounting periods:", error);
        throw error;
      }
    },
  });

  // Get the current active period (if any)
  const currentPeriod = periods.find(p => !p.is_closed);

  return { periods, currentPeriod, isLoading, error };
};
