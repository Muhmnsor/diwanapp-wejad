
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface JournalStats {
  totalTransactions: number;
  totalPostedAmount: number;
  totalDraftAmount: number;
  transactionsToday: number;
}

export const useJournalEntryStats = () => {
  const [stats, setStats] = useState<JournalStats>({
    totalTransactions: 0,
    totalPostedAmount: 0,
    totalDraftAmount: 0,
    transactionsToday: 0,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["journal_entry_stats"],
    queryFn: async () => {
      // Get current date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch all journal entries
      const { data: entries, error: entriesError } = await supabase
        .from("accounting_journal_entries")
        .select("id, date, status, total_amount");
        
      if (entriesError) throw entriesError;

      // Count transactions
      const totalTransactions = entries.length;
      
      // Calculate total posted amount
      let postedAmount = 0;
      let draftAmount = 0;
      let todayTransactions = 0;
      
      entries.forEach(entry => {
        // Check if transaction is from today
        if (entry.date === today) {
          todayTransactions++;
        }
        
        // Sum amounts based on status
        const amount = Number(entry.total_amount) || 0;
        if (entry.status === 'posted') {
          postedAmount += amount;
        } else if (entry.status === 'draft') {
          draftAmount += amount;
        }
      });
      
      return {
        totalTransactions,
        totalPostedAmount: postedAmount,
        totalDraftAmount: draftAmount,
        transactionsToday: todayTransactions
      };
    }
  });

  useEffect(() => {
    if (data) {
      setStats(data);
    }
  }, [data]);

  return {
    ...stats,
    isLoading,
    error
  };
};
