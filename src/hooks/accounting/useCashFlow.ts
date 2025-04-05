
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CashFlowActivity {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: "operating" | "investing" | "financing";
}

interface CashFlowStatement {
  operatingActivities: CashFlowActivity[];
  investingActivities: CashFlowActivity[];
  financingActivities: CashFlowActivity[];
  totalOperating: number;
  totalInvesting: number;
  totalFinancing: number;
  netChange: number;
  startDate: string;
  endDate: string;
  beginningBalance: number;
  endingBalance: number;
}

export const useCashFlow = (startDate: Date, endDate: Date) => {
  const formattedStartDate = startDate.toISOString().split('T')[0];
  const formattedEndDate = endDate.toISOString().split('T')[0];
  
  return useQuery({
    queryKey: ["cash_flow", formattedStartDate, formattedEndDate],
    queryFn: async (): Promise<CashFlowStatement> => {
      try {
        // Get cash accounts
        const { data: cashAccounts, error: cashAccountsError } = await supabase
          .from("accounting_accounts")
          .select("*")
          .eq("account_type", "asset")
          .ilike("name", "%cash%");
          
        if (cashAccountsError) throw cashAccountsError;
        
        // Get all cash-related journal items for the period
        const cashAccountIds = cashAccounts.map(account => account.id);
        
        // If no cash accounts found, return empty statement
        if (cashAccountIds.length === 0) {
          return {
            operatingActivities: [],
            investingActivities: [],
            financingActivities: [],
            totalOperating: 0,
            totalInvesting: 0,
            totalFinancing: 0,
            netChange: 0,
            startDate: formattedStartDate,
            endDate: formattedEndDate,
            beginningBalance: 0,
            endingBalance: 0
          };
        }
        
        // Get beginning balance (all transactions before start date)
        const { data: beginningBalanceItems, error: beginningBalanceError } = await supabase
          .from("accounting_journal_entries")
          .select(`
            date, 
            description,
            items:accounting_journal_items (
              account_id,
              debit_amount,
              credit_amount
            )
          `)
          .lt("date", formattedStartDate)
          .eq("status", "posted");
        
        if (beginningBalanceError) throw beginningBalanceError;
        
        // Calculate beginning balance
        let beginningBalance = 0;
        beginningBalanceItems.forEach(entry => {
          entry.items.forEach((item: any) => {
            if (cashAccountIds.includes(item.account_id)) {
              beginningBalance += Number(item.debit_amount) - Number(item.credit_amount);
            }
          });
        });
        
        // Get journal entries for the period
        const { data: journalEntries, error: entriesError } = await supabase
          .from("accounting_journal_entries")
          .select(`
            id,
            date, 
            description,
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
        
        // Get all accounts to categorize transactions
        const { data: allAccounts, error: accountsError } = await supabase
          .from("accounting_accounts")
          .select("*");
          
        if (accountsError) throw accountsError;
        
        // Create a map of account types for faster lookup
        const accountTypeMap: Record<string, string> = {};
        allAccounts.forEach(account => {
          accountTypeMap[account.id] = account.account_type;
        });
        
        // Categorize cash flow activities
        const operatingActivities: CashFlowActivity[] = [];
        const investingActivities: CashFlowActivity[] = [];
        const financingActivities: CashFlowActivity[] = [];
        
        // Process each journal entry
        journalEntries.forEach(entry => {
          // Check if this entry involves a cash account
          const cashItems = entry.items.filter((item: any) => 
            cashAccountIds.includes(item.account_id)
          );
          
          if (cashItems.length === 0) return;
          
          // Determine the cash effect
          let cashEffect = 0;
          cashItems.forEach((item: any) => {
            cashEffect += Number(item.debit_amount) - Number(item.credit_amount);
          });
          
          if (cashEffect === 0) return;
          
          // Determine the category based on the non-cash accounts in this transaction
          const nonCashItems = entry.items.filter((item: any) => 
            !cashAccountIds.includes(item.account_id)
          );
          
          let category: "operating" | "investing" | "financing" = "operating";
          
          // Simple categorization rules (can be refined)
          for (const item of nonCashItems) {
            const accountType = accountTypeMap[item.account_id];
            
            // Fixed assets, investments -> investing
            if (accountType === "asset" && 
                (item.account_id.includes("fixed") || item.account_id.includes("invest"))) {
              category = "investing";
              break;
            }
            
            // Loans, capital -> financing
            if ((accountType === "liability" && item.account_id.includes("loan")) ||
                (accountType === "equity")) {
              category = "financing";
              break;
            }
          }
          
          // Create the cash flow activity
          const activity: CashFlowActivity = {
            id: entry.id,
            description: entry.description,
            amount: Math.abs(cashEffect),
            date: entry.date,
            type: category
          };
          
          // Add to appropriate category
          if (category === "operating") {
            operatingActivities.push(activity);
          } else if (category === "investing") {
            investingActivities.push(activity);
          } else {
            financingActivities.push(activity);
          }
        });
        
        // Calculate totals
        const totalOperating = operatingActivities.reduce((sum, activity) => sum + activity.amount, 0);
        const totalInvesting = investingActivities.reduce((sum, activity) => sum + activity.amount, 0);
        const totalFinancing = financingActivities.reduce((sum, activity) => sum + activity.amount, 0);
        
        const netChange = totalOperating + totalInvesting + totalFinancing;
        const endingBalance = beginningBalance + netChange;
        
        return {
          operatingActivities,
          investingActivities,
          financingActivities,
          totalOperating,
          totalInvesting,
          totalFinancing,
          netChange,
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          beginningBalance,
          endingBalance
        };
      } catch (error) {
        console.error("Error fetching cash flow data:", error);
        throw error;
      }
    },
  });
};
