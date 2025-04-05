
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface MonthlyFinancialData {
  month: string;
  revenue: number;
  expense: number;
}

export const useMonthlyFinancials = () => {
  const [monthlyData, setMonthlyData] = useState<MonthlyFinancialData[]>([]);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ["monthly_financials"],
    queryFn: async () => {
      // Get current year
      const currentYear = new Date().getFullYear();
      const startDate = `${currentYear}-01-01`;
      const endDate = `${currentYear}-12-31`;
      
      // Fetch all journal entries for the current year
      const { data: entries, error: entriesError } = await supabase
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
            account:accounting_accounts (
              id,
              account_type
            )
          )
        `)
        .eq("status", "posted")
        .gte("date", startDate)
        .lte("date", endDate);
        
      if (entriesError) throw entriesError;

      // Initialize monthly data
      const months = Array.from({ length: 12 }, (_, i) => {
        const monthNum = i + 1;
        const monthName = new Date(currentYear, i, 1).toLocaleDateString('ar-SA', { month: 'short' });
        return {
          month: monthName,
          monthNum: monthNum,
          revenue: 0,
          expense: 0
        };
      });
      
      // Process journal entries to calculate monthly revenues and expenses
      entries.forEach(entry => {
        // Get month from entry date (1-12)
        const entryDate = new Date(entry.date);
        const monthIndex = entryDate.getMonth();
        
        entry.items.forEach((item: any) => {
          if (item.account && item.account.account_type === 'revenue') {
            // For revenue accounts: credit increases, debit decreases
            months[monthIndex].revenue += Number(item.credit_amount) - Number(item.debit_amount);
          } else if (item.account && item.account.account_type === 'expense') {
            // For expense accounts: debit increases, credit decreases
            months[monthIndex].expense += Number(item.debit_amount) - Number(item.credit_amount);
          }
        });
      });
      
      return months;
    }
  });

  useEffect(() => {
    if (data) {
      setMonthlyData(data);
    }
  }, [data]);

  return {
    monthlyData,
    isLoading,
    error
  };
};
