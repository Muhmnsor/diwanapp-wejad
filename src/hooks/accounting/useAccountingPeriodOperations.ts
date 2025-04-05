
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AccountingPeriod } from "./useAccountingPeriods";
import { useQueryClient } from "@tanstack/react-query";

export const useAccountingPeriodOperations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const createPeriod = async (periodData: Omit<AccountingPeriod, "id" | "created_at" | "updated_at">) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from("accounting_periods")
        .insert(periodData)
        .select()
        .single();
      
      if (error) throw error;
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["accounting_periods"] });
      
      return { success: true, data };
    } catch (error) {
      console.error("Error creating accounting period:", error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const updatePeriod = async (id: string, periodData: Partial<Omit<AccountingPeriod, "id" | "created_at" | "updated_at">>) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from("accounting_periods")
        .update(periodData)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["accounting_periods"] });
      
      return { success: true, data };
    } catch (error) {
      console.error("Error updating accounting period:", error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const closePeriod = async (id: string) => {
    return updatePeriod(id, { is_closed: true });
  };

  return {
    createPeriod,
    updatePeriod,
    closePeriod,
    isLoading
  };
};
