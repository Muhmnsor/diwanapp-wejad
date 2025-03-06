
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BudgetItem, ResourceObligation } from "../types";

interface SubmitProps {
  resourceId: string;
  totalAmount: number;
  source: string;
  customSource?: string;
  type: string;
  entity: string;
  budgetItems: BudgetItem[];
  obligations: ResourceObligation[];
  isValidPercentages: boolean;
  useDefaultPercentages: boolean;
  setIsLoading: (value: boolean) => void;
  onComplete: () => void;
}

export const useEditFormSubmit = () => {
  const handleSubmit = async ({
    resourceId,
    totalAmount,
    source,
    customSource,
    type,
    entity,
    budgetItems,
    obligations,
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

    // Validate custom source if "أخرى" is selected
    if (source === "أخرى" && (!customSource || customSource.trim() === "")) {
      toast.error("الرجاء إدخال اسم المصدر المخصص");
      return;
    }

    setIsLoading(true);
    
    try {
      const resourceType = (document.getElementById("type") as HTMLSelectElement)?.value || type;
      const entityValue = (document.getElementById("entity") as HTMLInputElement)?.value || entity;
      const totalObligationsAmount = obligations.reduce((total, obligation) => total + obligation.amount, 0);
      const netAmount = totalAmount - totalObligationsAmount;
      
      // Determine final source value
      const finalSource = source === "أخرى" ? customSource : source;
      
      // 1. Update financial resource
      const { error: resourceError } = await supabase
        .from('financial_resources')
        .update({
          source: finalSource,
          type: resourceType,
          entity: entityValue,
          total_amount: totalAmount,
          obligations_amount: totalObligationsAmount,
          net_amount: netAmount
        })
        .eq('id', resourceId);

      if (resourceError) throw resourceError;
      
      // 2. Delete old obligations
      const { error: deleteObligationsError } = await supabase
        .from('resource_obligations')
        .delete()
        .eq('resource_id', resourceId);
        
      if (deleteObligationsError) throw deleteObligationsError;
      
      // 3. Add new obligations
      if (obligations.length > 0) {
        const obligationsToInsert = obligations.map(obligation => ({
          resource_id: resourceId,
          amount: obligation.amount,
          description: obligation.description
        }));
        
        const { error: insertObligationsError } = await supabase
          .from('resource_obligations')
          .insert(obligationsToInsert);
          
        if (insertObligationsError) throw insertObligationsError;
      }
      
      // 4. Delete old distributions
      const { error: deleteError } = await supabase
        .from('resource_distributions')
        .delete()
        .eq('resource_id', resourceId);
        
      if (deleteError) throw deleteError;
      
      // 5. Add new distributions
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
