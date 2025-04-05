
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AccountSummary {
  assetTotal: number;
  liabilityTotal: number;
  equityTotal: number;
  revenueTotal: number;
  expenseTotal: number;
  netIncome: number;
}

export const useAccountsSummary = () => {
  const [summary, setSummary] = useState<AccountSummary>({
    assetTotal: 0,
    liabilityTotal: 0,
    equityTotal: 0,
    revenueTotal: 0,
    expenseTotal: 0,
    netIncome: 0,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["accounting_accounts_summary"],
    queryFn: async () => {
      // Fetch all accounts
      const { data: accounts, error: accountsError } = await supabase
        .from("accounting_accounts")
        .select("*");

      if (accountsError) throw accountsError;

      // Fetch all journal entries and items
      const { data: journalEntries, error: journalError } = await supabase
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

      if (journalError) throw journalError;

      // Create a map of accounts by ID for quick reference
      const accountsMap = {};
      accounts.forEach(account => {
        accountsMap[account.id] = account;
      });

      // Calculate balances for each account type
      let assetBalance = 0;
      let liabilityBalance = 0;
      let equityBalance = 0;
      let revenueBalance = 0;
      let expenseBalance = 0;

      // Process journal entries to calculate account balances
      journalEntries.forEach(entry => {
        entry.items.forEach(item => {
          const account = accountsMap[item.account_id];
          if (!account) return;

          const debitAmount = Number(item.debit_amount) || 0;
          const creditAmount = Number(item.credit_amount) || 0;
          
          switch (account.account_type) {
            case 'asset':
              // For assets: debit increases, credit decreases
              assetBalance += debitAmount - creditAmount;
              break;
            case 'liability':
              // For liabilities: credit increases, debit decreases
              liabilityBalance += creditAmount - debitAmount;
              break;
            case 'equity':
              // For equity: credit increases, debit decreases
              equityBalance += creditAmount - debitAmount;
              break;
            case 'revenue':
              // For revenue: credit increases, debit decreases
              revenueBalance += creditAmount - debitAmount;
              break;
            case 'expense':
              // For expenses: debit increases, credit decreases
              expenseBalance += debitAmount - creditAmount;
              break;
          }
        });
      });

      // Calculate net income: Revenue - Expenses
      const netIncome = revenueBalance - expenseBalance;

      return {
        assetTotal: assetBalance,
        liabilityTotal: liabilityBalance,
        equityTotal: equityBalance,
        revenueTotal: revenueBalance,
        expenseTotal: expenseBalance,
        netIncome: netIncome
      };
    },
  });

  useEffect(() => {
    if (data) {
      setSummary(data);
    }
  }, [data]);

  return {
    ...summary,
    isLoading,
    error
  };
};
