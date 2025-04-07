// src/hooks/accounting/useMonthlyRevenueExpenses.ts
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { addMonths, format, subMonths, startOfMonth } from "date-fns";
import { ar } from "date-fns/locale";

interface MonthlyData {
  month: string;
  revenue: number;
  expenses: number;
}

export const useMonthlyRevenueExpenses = () => {
  return useQuery({
    queryKey: ["monthly_revenue_expenses"],
    queryFn: async (): Promise<MonthlyData[]> => {
      // Get current date and 11 months ago
      const currentDate = new Date();
      const elevenMonthsAgo = subMonths(startOfMonth(currentDate), 11);
      
      // Fetch journal entries for the last 12 months
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
            credit_amount,
            account:account_id (
              id,
              account_type
            )
          )
        `)
        .eq("status", "posted")
        .gte("date", elevenMonthsAgo.toISOString().split('T')[0]);

      if (journalError) throw journalError;

      // Initialize result array with 12 months
      const monthlyData: MonthlyData[] = [];
      
      // Initialize the last 12 months data structure
      for (let i = 0; i < 12; i++) {
        const monthDate = subMonths(currentDate, 11 - i);
        monthlyData.push({
          month: format(monthDate, 'MMM yyyy', { locale: ar }),
          revenue: 0,
          expenses: 0
        });
      }
      
      // Process journal entries
      journalEntries.forEach(entry => {
        const entryDate = new Date(entry.date);
        const monthIndex = Math.floor(
          (entryDate.getTime() - elevenMonthsAgo.getTime()) / 
          (30 * 24 * 60 * 60 * 1000)
        );
        
        if (monthIndex >= 0 && monthIndex < 12) {
          entry.items.forEach(item => {
            if (item.account && item.account.account_type) {
              const debitAmount = Number(item.debit_amount) || 0;
              const creditAmount = Number(item.credit_amount) || 0;
              
              if (item.account.account_type === 'revenue') {
                // For revenue: credit increases, debit decreases
                monthlyData[monthIndex].revenue += creditAmount - debitAmount;
              }
              else if (item.account.account_type === 'expense') {
                // For expenses: debit increases, credit decreases
                monthlyData[monthIndex].expenses += debitAmount - creditAmount;
              }
            }
          });
        }
      });
      
      return monthlyData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

