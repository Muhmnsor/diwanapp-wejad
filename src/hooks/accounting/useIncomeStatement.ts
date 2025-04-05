
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AccountSummary {
  id: string;
  code: string;
  name: string;
  amount: number;
}

interface IncomeStatementData {
  revenues: AccountSummary[];
  expenses: AccountSummary[];
  totalRevenues: number;
  totalExpenses: number;
  netIncome: number;
  startDate: string;
  endDate: string;
}

export const useIncomeStatement = (startDate: Date, endDate: Date) => {
  const formattedStartDate = startDate.toISOString().split('T')[0];
  const formattedEndDate = endDate.toISOString().split('T')[0];
  
  return useQuery({
    queryKey: ["income_statement", formattedStartDate, formattedEndDate],
    queryFn: async (): Promise<IncomeStatementData> => {
      try {
        // Get revenue and expense accounts
        const { data: accounts, error: accountsError } = await supabase
          .from("accounting_accounts")
          .select("*")
          .in("account_type", ["revenue", "expense"])
          .order("code", { ascending: true });
          
        if (accountsError) throw accountsError;
        
        // Get all journal items for the period
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
          .gte("date", formattedStartDate)
          .lte("date", formattedEndDate)
          .eq("status", "posted");
          
        if (entriesError) throw entriesError;
        
        // Create map of account ID to account details
        const accountMap: Record<string, any> = {};
        accounts.forEach(account => {
          accountMap[account.id] = {
            ...account,
            amount: 0,
          };
        });
        
        // Calculate amounts from journal entries
        journalEntries.forEach(entry => {
          entry.items.forEach((item: any) => {
            const account = accountMap[item.account_id];
            if (!account) return;
            
            if (account.account_type === 'revenue') {
              account.amount += (Number(item.credit_amount) - Number(item.debit_amount));
            } else if (account.account_type === 'expense') {
              account.amount += (Number(item.debit_amount) - Number(item.credit_amount));
            }
          });
        });
        
        // Group accounts by type with non-zero amounts
        const revenues = Object.values(accountMap)
          .filter(acc => acc.account_type === 'revenue' && acc.amount !== 0)
          .map(acc => ({
            id: acc.id,
            code: acc.code,
            name: acc.name,
            amount: acc.amount,
          }));
          
        const expenses = Object.values(accountMap)
          .filter(acc => acc.account_type === 'expense' && acc.amount !== 0)
          .map(acc => ({
            id: acc.id,
            code: acc.code,
            name: acc.name,
            amount: acc.amount,
          }));
        
        // Calculate totals
        const totalRevenues = revenues.reduce((sum, acc) => sum + acc.amount, 0);
        const totalExpenses = expenses.reduce((sum, acc) => sum + acc.amount, 0);
        const netIncome = totalRevenues - totalExpenses;
        
        return {
          revenues,
          expenses,
          totalRevenues,
          totalExpenses,
          netIncome,
          startDate: formattedStartDate,
          endDate: formattedEndDate,
        };
      } catch (error) {
        console.error("Error fetching income statement data:", error);
        throw error;
      }
    },
  });
};
