
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface LedgerEntry {
  account_id: string;
  account_code: string;
  account_name: string;
  debit_total: number;
  credit_total: number;
  balance: number;
  account_type: string;
}

export const useLedger = (startDate?: Date, endDate?: Date) => {
  const formattedStartDate = startDate ? startDate.toISOString().split('T')[0] : undefined;
  const formattedEndDate = endDate ? endDate.toISOString().split('T')[0] : undefined;
  
  return useQuery({
    queryKey: ["general_ledger", formattedStartDate, formattedEndDate],
    queryFn: async (): Promise<LedgerEntry[]> => {
      try {
        // Get all accounts
        const { data: accounts, error: accountsError } = await supabase
          .from("accounting_accounts")
          .select("*")
          .order("code", { ascending: true });
          
        if (accountsError) throw accountsError;
        
        // Get all journal entries between dates (if specified)
        let journalEntriesQuery = supabase
          .from("accounting_journal_entries")
          .select(`
            id,
            date,
            status,
            items:accounting_journal_items (
              id,
              account_id,
              debit_amount,
              credit_amount
            )
          `)
          .eq("status", "posted");
          
        if (formattedStartDate) {
          journalEntriesQuery = journalEntriesQuery.gte("date", formattedStartDate);
        }
        
        if (formattedEndDate) {
          journalEntriesQuery = journalEntriesQuery.lte("date", formattedEndDate);
        }
        
        const { data: journalEntries, error: entriesError } = await journalEntriesQuery;
          
        if (entriesError) throw entriesError;
        
        // Initialize ledger entries
        const ledger: Record<string, LedgerEntry> = {};
        
        // Initialize with all accounts
        accounts.forEach(account => {
          ledger[account.id] = {
            account_id: account.id,
            account_code: account.code,
            account_name: account.name,
            debit_total: 0,
            credit_total: 0,
            balance: 0,
            account_type: account.account_type,
          };
        });
        
        // Process journal entries
        journalEntries.forEach(entry => {
          entry.items.forEach((item: any) => {
            const account = ledger[item.account_id];
            if (!account) return;
            
            account.debit_total += Number(item.debit_amount);
            account.credit_total += Number(item.credit_amount);
          });
        });
        
        // Calculate balances
        Object.values(ledger).forEach(entry => {
          if (entry.account_type === 'asset' || entry.account_type === 'expense') {
            entry.balance = entry.debit_total - entry.credit_total;
          } else {
            entry.balance = entry.credit_total - entry.debit_total;
          }
        });
        
        return Object.values(ledger);
      } catch (error) {
        console.error("Error fetching general ledger data:", error);
        throw error;
      }
    },
  });
};
