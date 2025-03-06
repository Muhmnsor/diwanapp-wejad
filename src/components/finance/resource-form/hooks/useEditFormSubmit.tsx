
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BudgetItem } from "../types";

interface SubmitProps {
  resourceId: string;
  totalAmount: number;
  obligationsAmount: number;
  source: string;
  type: string;
  entity: string;
  budgetItems: BudgetItem[];
  isValidPercentages: boolean;
  useDefaultPercentages: boolean;
  setIsLoading: (value: boolean) => void;
  onComplete: () => void;
}

export const useEditFormSubmit = () => {
  const handleSubmit = async ({
    resourceId,
    totalAmount,
    obligationsAmount,
    source,
    type,
    entity,
    budgetItems,
    isValidPercentages,
    useDefaultPercentages,
    setIsLoading,
    onComplete
  }: SubmitProps, e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate data
    if (totalAmount <= 0) {
      toast.error("الرجاء إدخال مبلغ إجمالي صحيح");
      return;
    }
    
    // Validate percentages if custom
    if (!useDefaultPercentages && !isValidPercentages) {
      toast.error("مجموع النسب المئوية يجب أن يكون 100%");
      return;
    }

    setIsLoading(true);
    
    try {
      const resourceType = (document.getElementById("type") as HTMLSelectElement)?.value || type;
      const entityValue = (document.getElementById("entity") as HTMLInputElement)?.value || entity;
      const netAmount = totalAmount - obligationsAmount;
      
      // 1. Update financial resource
      const { error: resourceError } = await supabase
        .from('financial_resources')
        .update({
          source,
          type: resourceType,
          entity: entityValue,
          total_amount: totalAmount,
          obligations_amount: obligationsAmount,
          net_amount: netAmount
        })
        .eq('id', resourceId);

      if (resourceError) throw resourceError;
      
      // 2. Delete old distributions
      const { error: deleteError } = await supabase
        .from('resource_distributions')
        .delete()
        .eq('resource_id', resourceId);
        
      if (deleteError) throw deleteError;
      
      // 3. Add new distributions
      const newDistributions = budgetItems.map(item => ({
        resource_id: resourceId,
        budget_item_id: item.id,
        percentage: item.percentage,
        amount: item.value
      }));
      
      const { error: distributionError } = await supabase
        .from('resource_distributions')
        .insert(newDistributions);
      
      if (distributionError) throw distributionError;
      
      toast.success("تم تعديل المورد بنجاح");
      onComplete();
    } catch (error: any) {
      console.error("خطأ في تعديل المورد:", error);
      toast.error(error.message || "حدث خطأ أثناء تعديل المورد");
    } finally {
      setIsLoading(false);
    }
  };

  return { handleSubmit };
};
