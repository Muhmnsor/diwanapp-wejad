
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface MonthlyData {
  month: string;
  expenses: number;
  revenues: number;
}

export const useMonthlyComparison = () => {
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ["accounting_monthly_comparison"],
    queryFn: async () => {
      // Get current year
      const currentYear = new Date().getFullYear();
      
      // Arabic month names
      const monthNames = [
        "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
        "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
      ];
      
      // Generate monthly data structure
      const months = Array.from({ length: 12 }, (_, i) => {
        return {
          month: monthNames[i],
          expenses: 0,
          revenues: 0
        };
      });
      
      // Fetch all journal entries for the current year
      const startDate = `${currentYear}-01-01`;
      const endDate = `${currentYear}-12-31`;
      
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
      
      // Process the entries to calculate monthly expenses and revenues
      entries.forEach(entry => {
        if (entry.date) {
          const entryDate = new Date(entry.date);
          const monthIndex = entryDate.getMonth();
          
          // Process each journal item
          entry.items.forEach((item: any) => {
            if (item.account && item.account.account_type) {
              const accountType = item.account.account_type;
              const debitAmount = Number(item.debit_amount) || 0;
              const creditAmount = Number(item.credit_amount) || 0;
              
              // Calculate expenses (debit increases expense accounts)
              if (accountType === 'expense') {
                months[monthIndex].expenses += debitAmount - creditAmount;
              }
              
              // Calculate revenues (credit increases revenue accounts)
              if (accountType === 'revenue') {
                months[monthIndex].revenues += creditAmount - debitAmount;
              }
            }
          });
        }
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
