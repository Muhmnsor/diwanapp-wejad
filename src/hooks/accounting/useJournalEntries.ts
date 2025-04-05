
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface JournalEntry {
  id: string;
  date: string;
  reference_number?: string;
  description: string;
  status: 'draft' | 'posted' | 'cancelled';
  total_amount?: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
  approved_by?: string;
}

export interface JournalItem {
  id: string;
  journal_entry_id: string;
  account_id: string;
  description?: string;
  debit_amount: number;
  credit_amount: number;
  cost_center_id?: string;
}

export const useJournalEntries = () => {
  return useQuery({
    queryKey: ["accounting_journal_entries"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("accounting_journal_entries")
          .select(`
            id,
            date,
            reference_number,
            description,
            status,
            total_amount,
            created_at,
            updated_at,
            created_by,
            approved_by,
            items:accounting_journal_items (
              id,
              account_id,
              description,
              debit_amount,
              credit_amount,
              cost_center_id
            )
          `)
          .order('date', { ascending: false });

        if (error) {
          throw error;
        }

        return data as (JournalEntry & { items: JournalItem[] })[];
      } catch (error) {
        console.error("Error fetching journal entries:", error);
        throw error;
      }
    },
  });
};
