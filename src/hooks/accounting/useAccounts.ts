
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Account {
  id: string;
  code: string;
  name: string;
  account_type: string;
  parent_id?: string;
  level: number;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const useAccounts = () => {
  const { data: accounts = [], isLoading, error } = useQuery({
    queryKey: ["accounting_accounts"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("accounting_accounts")
          .select("*")
          .order("code", { ascending: true });

        if (error) {
          throw error;
        }

        return data as Account[];
      } catch (error) {
        console.error("Error fetching accounts:", error);
        throw error;
      }
    },
  });

  return { accounts, isLoading, error };
};
