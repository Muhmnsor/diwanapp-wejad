
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface OpeningBalance {
  id: string;
  account_id: string;
  period_id: string;
  debit_amount: number;
  credit_amount: number;
  created_at: string;
  updated_at: string;
  account?: {
    id: string;
    code: string;
    name: string;
    account_type: string;
  };
}

export const useOpeningBalances = (periodId?: string) => {
  const { data: openingBalances = [], isLoading, error, refetch } = useQuery({
    queryKey: ["accounting_opening_balances", periodId],
    queryFn: async () => {
      try {
        let query = supabase
          .from("accounting_opening_balances")
          .select(`
            *,
            account:accounting_accounts (
              id,
              code,
              name,
              account_type
            )
          `);
          
        if (periodId) {
          query = query.eq("period_id", periodId);
        }

        const { data, error } = await query;

        if (error) {
          throw error;
        }

        return data as OpeningBalance[];
      } catch (error) {
        console.error("Error fetching opening balances:", error);
        throw error;
      }
    },
    enabled: !!periodId, // Only run if periodId is provided
  });

  return { openingBalances, isLoading, error, refetch };
};
