
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AccountBalance {
  id: string;
  code: string;
  name: string;
  account_type: string;
  parent_id: string | null;
  level: number;
  balance: number;
}

interface BalanceSheetData {
  assets: AccountBalance[];
  liabilities: AccountBalance[];
  equity: AccountBalance[];
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  date: string;
}

export const useBalanceSheet = (date: Date = new Date()) => {
  const formattedDate = date.toISOString().split('T')[0];
  
  return useQuery({
    queryKey: ["balance_sheet", formattedDate],
    queryFn: async (): Promise<BalanceSheetData> => {
      try {
        // Get all accounts
        const { data: accounts, error: accountsError } = await supabase
          .from("accounting_accounts")
          .select("*")
          .order("code", { ascending: true });
          
        if (accountsError) throw accountsError;
        
        // Get all journal items for transactions up to the specified date
        const { data: journalItems, error: itemsError } = await supabase
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
          
        if (itemsError) throw itemsError;

        // Calculate account balances
        const accountBalances: Record<string, AccountBalance> = {};
        
        // Initialize account balances
        accounts.forEach(account => {
          accountBalances[account.id] = {
            ...account,
            balance: 0,
          };
        });
        
        // Calculate balances from journal items
        journalItems.forEach(entry => {
          entry.items.forEach((item: any) => {
            if (!accountBalances[item.account_id]) return;
            
            const account = accountBalances[item.account_id];
            const accountType = account.account_type;
            
            // For assets and expenses, debit increases, credit decreases
            if (accountType === 'asset' || accountType === 'expense') {
              account.balance += (Number(item.debit_amount) - Number(item.credit_amount));
            }
            // For liabilities, equity, and revenue, credit increases, debit decreases
            else {
              account.balance += (Number(item.credit_amount) - Number(item.debit_amount));
            }
          });
        });
        
        // Group accounts by type
        const assets = Object.values(accountBalances).filter(
          acc => acc.account_type === 'asset' && acc.balance !== 0
        );
        
        const liabilities = Object.values(accountBalances).filter(
          acc => acc.account_type === 'liability' && acc.balance !== 0
        );
        
        const equity = Object.values(accountBalances).filter(
          acc => acc.account_type === 'equity' && acc.balance !== 0
        );
        
        // Calculate revenue and expenses for retained earnings
        const revenues = Object.values(accountBalances).filter(
          acc => acc.account_type === 'revenue' && acc.balance !== 0
        );
        
        const expenses = Object.values(accountBalances).filter(
          acc => acc.account_type === 'expense' && acc.balance !== 0
        );
        
        const totalRevenue = revenues.reduce((sum, acc) => sum + acc.balance, 0);
        const totalExpenses = expenses.reduce((sum, acc) => sum + acc.balance, 0);
        const retainedEarnings = totalRevenue - totalExpenses;
        
        // Add retained earnings to equity if it's not zero
        if (retainedEarnings !== 0) {
          equity.push({
            id: "retained-earnings",
            code: "3900",
            name: "الأرباح المحتجزة",
            account_type: "equity",
            parent_id: null,
            level: 1,
            balance: retainedEarnings,
          });
        }
        
        // Calculate totals
        const totalAssets = assets.reduce((sum, acc) => sum + acc.balance, 0);
        const totalLiabilities = liabilities.reduce((sum, acc) => sum + acc.balance, 0);
        const totalEquity = equity.reduce((sum, acc) => sum + acc.balance, 0);
        
        return {
          assets,
          liabilities,
          equity,
          totalAssets,
          totalLiabilities,
          totalEquity,
          date: formattedDate,
        };
      } catch (error) {
        console.error("Error fetching balance sheet data:", error);
        throw error;
      }
    },
  });
};
