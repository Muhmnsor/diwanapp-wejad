
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CostCenter } from "./useCostCenters";
import { useQueryClient } from "@tanstack/react-query";

export const useCostCenterOperations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const createCostCenter = async (costCenterData: Omit<CostCenter, "id" | "created_at">) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from("accounting_cost_centers")
        .insert(costCenterData)
        .select()
        .single();
      
      if (error) throw error;
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["accounting_cost_centers"] });
      
      return { success: true, data };
    } catch (error) {
      console.error("Error creating cost center:", error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const updateCostCenter = async (id: string, costCenterData: Partial<Omit<CostCenter, "id" | "created_at">>) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from("accounting_cost_centers")
        .update(costCenterData)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["accounting_cost_centers"] });
      
      return { success: true, data };
    } catch (error) {
      console.error("Error updating cost center:", error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCostCenterStatus = async (id: string, isActive: boolean) => {
    return updateCostCenter(id, { is_active: !isActive });
  };

  return {
    createCostCenter,
    updateCostCenter,
    toggleCostCenterStatus,
    isLoading
  };
};
