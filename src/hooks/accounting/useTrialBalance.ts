
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TrialBalanceEntry {
  account_id: string;
  account_code: string;
  account_name: string;
  account_type: string;
  debit_balance: number;
  credit_balance: number;
}

export interface TrialBalanceData {
  entries: TrialBalanceEntry[];
  totalDebit: number;
  totalCredit: number;
  date: string;
  isBalanced: boolean;
}

export const useTrialBalance = (date: Date = new Date()) => {
  const formattedDate = date.toISOString().split('T')[0];
  
  return useQuery({
    queryKey: ["trial_balance", formattedDate],
    queryFn: async (): Promise<TrialBalanceData> => {
      try {
        // Get all accounts
        const { data: accounts, error: accountsError } = await supabase
          .from("accounting_accounts")
          .select("*")
          .order("code", { ascending: true });
          
        if (accountsError) throw accountsError;
        
        // Get all journal entries up to the specified date
        const { data: journalEntries, error: entriesError } = await supabase
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
          .lte("date", formattedDate)
          .eq("status", "posted");
          
        if (entriesError) throw entriesError;
        
        // Initialize trial balance entries
        const trialBalanceMap: Record<string, TrialBalanceEntry> = {};
        
        // Initialize with all accounts
        accounts.forEach(account => {
          trialBalanceMap[account.id] = {
            account_id: account.id,
            account_code: account.code,
            account_name: account.name,
            account_type: account.account_type,
            debit_balance: 0,
            credit_balance: 0,
          };
        });
        
        // Calculate account balances from journal entries
        journalEntries.forEach(entry => {
          entry.items.forEach((item: any) => {
            const account = trialBalanceMap[item.account_id];
            if (!account) return;
            
            const debitAmount = Number(item.debit_amount);
            const creditAmount = Number(item.credit_amount);
            
            if (account.account_type === 'asset' || account.account_type === 'expense') {
              // For assets and expenses: Debit increases, Credit decreases
              account.debit_balance += debitAmount;
              account.credit_balance += creditAmount;
            } else {
              // For liabilities, equity, and revenue: Credit increases, Debit decreases
              account.debit_balance += debitAmount;
              account.credit_balance += creditAmount;
            }
          });
        });
        
        // Calculate final balances
        const entries = Object.values(trialBalanceMap).map(entry => {
          // Determine the net balance
          const netBalance = entry.debit_balance - entry.credit_balance;
          
          // Reset and set the appropriate balance
          const adjustedEntry = { ...entry, debit_balance: 0, credit_balance: 0 };
          
          if (netBalance > 0) {
            adjustedEntry.debit_balance = netBalance;
          } else if (netBalance < 0) {
            adjustedEntry.credit_balance = Math.abs(netBalance);
          }
          
          return adjustedEntry;
        }).filter(entry => entry.debit_balance > 0 || entry.credit_balance > 0);
        
        // Calculate totals
        const totalDebit = entries.reduce((sum, entry) => sum + entry.debit_balance, 0);
        const totalCredit = entries.reduce((sum, entry) => sum + entry.credit_balance, 0);
        
        // Check if the trial balance is balanced
        const isBalanced = Math.abs(totalDebit - totalCredit) < 0.001; // Allow for small rounding errors
        
        return {
          entries,
          totalDebit,
          totalCredit,
          date: formattedDate,
          isBalanced
        };
      } catch (error) {
        console.error("Error fetching trial balance data:", error);
        throw error;
      }
    },
  });
};
