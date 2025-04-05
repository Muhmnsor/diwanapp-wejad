
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { OpeningBalance } from "./useOpeningBalances";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useOpeningBalanceOperations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const saveOpeningBalance = async (
    openingBalanceData: Omit<OpeningBalance, "id" | "created_at" | "updated_at" | "account">
  ) => {
    try {
      setIsLoading(true);
      console.log("Saving opening balance:", openingBalanceData);
      
      // Check if an opening balance already exists for this account and period
      const { data: existing, error: checkError } = await supabase
        .from("accounting_opening_balances")
        .select("id")
        .eq("account_id", openingBalanceData.account_id)
        .eq("period_id", openingBalanceData.period_id)
        .maybeSingle();
      
      if (checkError) {
        console.error("Error checking existing balance:", checkError);
        throw checkError;
      }
      
      let result;
      
      if (existing) {
        // Update existing record
        result = await supabase
          .from("accounting_opening_balances")
          .update({
            debit_amount: openingBalanceData.debit_amount,
            credit_amount: openingBalanceData.credit_amount,
          })
          .eq("id", existing.id)
          .select()
          .single();
      } else {
        // Insert new record
        result = await supabase
          .from("accounting_opening_balances")
          .insert(openingBalanceData)
          .select()
          .single();
      }
      
      if (result.error) {
        console.error("Error saving opening balance result:", result.error);
        throw result.error;
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ 
        queryKey: ["accounting_opening_balances", openingBalanceData.period_id] 
      });
      
      return { success: true, data: result.data };
    } catch (error) {
      console.error("Error saving opening balance:", error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const saveMultipleOpeningBalances = async (
    periodId: string,
    openingBalances: Array<{
      account_id: string;
      debit_amount: number;
      credit_amount: number;
    }>
  ) => {
    try {
      setIsLoading(true);
      
      const balancesToInsert = openingBalances.map(balance => ({
        period_id: periodId,
        account_id: balance.account_id,
        debit_amount: balance.debit_amount,
        credit_amount: balance.credit_amount,
      }));
      
      console.log("Saving multiple opening balances:", balancesToInsert);
      
      // Use upsert to handle existing records
      const { data, error } = await supabase
        .from("accounting_opening_balances")
        .upsert(
          balancesToInsert,
          {
            onConflict: 'account_id,period_id',
            ignoreDuplicates: false,
          }
        )
        .select();
      
      if (error) throw error;
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ 
        queryKey: ["accounting_opening_balances", periodId] 
      });
      
      return { success: true, data };
    } catch (error) {
      console.error("Error saving multiple opening balances:", error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteOpeningBalance = async (id: string, periodId: string) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from("accounting_opening_balances")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ 
        queryKey: ["accounting_opening_balances", periodId] 
      });
      
      return { success: true };
    } catch (error) {
      console.error("Error deleting opening balance:", error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    saveOpeningBalance,
    saveMultipleOpeningBalances,
    deleteOpeningBalance,
    isLoading
  };
};
