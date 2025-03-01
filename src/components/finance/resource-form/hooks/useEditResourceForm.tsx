
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BudgetItem } from "../types";

interface Resource {
  id: string;
  date: string;
  source: string;
  type: string;
  entity: string;
  total_amount: number;
  obligations_amount: number;
  net_amount: number;
}

export const useEditResourceForm = (resource: Resource, onSubmit: () => void) => {
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [useDefaultPercentages, setUseDefaultPercentages] = useState(true);
  const [totalAmount, setTotalAmount] = useState<number>(resource.total_amount);
  const [obligationsAmount, setObligationsAmount] = useState<number>(resource.obligations_amount);
  const [source, setSource] = useState(resource.source);
  const [type, setType] = useState(resource.type);
  const [entity, setEntity] = useState(resource.entity);
  const [isLoading, setIsLoading] = useState(false);
  const [distributions, setDistributions] = useState<any[]>([]);

  // Fetch budget items and distributions
  useEffect(() => {
    const fetchBudgetItems = async () => {
      try {
        // Fetch budget items
        const { data: itemsData, error: itemsError } = await supabase
          .from('budget_items')
          .select('id, name, default_percentage');

        if (itemsError) throw itemsError;
        
        // Fetch resource distributions
        const { data: distributionsData, error: distributionsError } = await supabase
          .from('resource_distributions')
          .select('*')
          .eq('resource_id', resource.id);

        if (distributionsError) throw distributionsError;
        
        setDistributions(distributionsData || []);

        // Prepare budget items with current values
        if (itemsData) {
          const items = itemsData.map(item => {
            const distribution = distributionsData?.find(d => d.budget_item_id === item.id);
            return {
              id: item.id,
              name: item.name,
              percentage: distribution ? distribution.percentage : item.default_percentage,
              value: distribution ? distribution.amount : 0
            };
          });
          
          setBudgetItems(items);
          
          // Determine percentage type (default or custom)
          if (distributionsData && distributionsData.length > 0) {
            // Check if percentages match default percentages
            const isDefault = distributionsData.every(dist => {
              const item = itemsData.find(i => i.id === dist.budget_item_id);
              return item && Math.abs(item.default_percentage - dist.percentage) < 0.1; // Approximate for decimal precision
            });
            
            setUseDefaultPercentages(isDefault);
          }
        }
      } catch (error) {
        console.error('Error fetching budget items and distributions:', error);
        toast.error('حدث خطأ أثناء جلب بنود الميزانية');
      }
    };

    fetchBudgetItems();
  }, [resource.id]);

  // Calculate values based on percentages and total amount
  useEffect(() => {
    if (budgetItems.length > 0) {
      const netAmount = totalAmount - obligationsAmount;
      const updatedItems = budgetItems.map(item => ({
        ...item,
        value: parseFloat(((netAmount * item.percentage) / 100).toFixed(2))
      }));
      setBudgetItems(updatedItems);
    }
  }, [totalAmount, obligationsAmount]);

  // Update total amount
  const handleTotalAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setTotalAmount(value);
    }
  };

  // Update obligations
  const handleObligationsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setObligationsAmount(value);
    }
  };

  // Update source
  const handleSourceChange = (value: string) => {
    setSource(value);
  };

  // Update percentage type (default or custom)
  const handleUseDefaultsChange = (value: string) => {
    const useDefaults = value === "default";
    setUseDefaultPercentages(useDefaults);
    
    // Recalculate percentages if changed to default
    if (useDefaults) {
      // Retrieve default percentages
      const fetchDefaultPercentages = async () => {
        try {
          const { data, error } = await supabase
            .from('budget_items')
            .select('id, name, default_percentage');
          
          if (error) throw error;
          
          if (data) {
            const netAmount = totalAmount - obligationsAmount;
            const updatedItems = budgetItems.map(item => {
              const defaultItem = data.find(i => i.id === item.id);
              return {
                ...item,
                percentage: defaultItem?.default_percentage || 0,
                value: defaultItem ? parseFloat(((netAmount * defaultItem.default_percentage) / 100).toFixed(2)) : 0
              };
            });
            setBudgetItems(updatedItems);
          }
        } catch (error) {
          console.error('Error fetching default percentages:', error);
        }
      };
      
      fetchDefaultPercentages();
    }
  };

  // Update item percentage
  const handleItemPercentageChange = (
    id: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newPercentage = parseFloat(e.target.value);
    if (isNaN(newPercentage)) return;

    const newItems = budgetItems.map((item) =>
      item.id === id ? { ...item, percentage: newPercentage } : item
    );
    
    // Calculate values based on new percentages
    const netAmount = totalAmount - obligationsAmount;
    const updatedItems = newItems.map(item => ({
      ...item,
      value: parseFloat(((netAmount * item.percentage) / 100).toFixed(2))
    }));
    
    setBudgetItems(updatedItems);
  };

  // Calculate total percentage
  const totalPercentage = budgetItems.reduce(
    (sum, item) => sum + item.percentage,
    0
  );

  // Verify percentages
  const isValidPercentages = Math.round(totalPercentage) === 100;

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
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
        .eq('id', resource.id);

      if (resourceError) throw resourceError;
      
      // 2. Delete old distributions
      const { error: deleteError } = await supabase
        .from('resource_distributions')
        .delete()
        .eq('resource_id', resource.id);
        
      if (deleteError) throw deleteError;
      
      // 3. Add new distributions
      const newDistributions = budgetItems.map(item => ({
        resource_id: resource.id,
        budget_item_id: item.id,
        percentage: item.percentage,
        amount: item.value
      }));
      
      const { error: distributionError } = await supabase
        .from('resource_distributions')
        .insert(newDistributions);
      
      if (distributionError) throw distributionError;
      
      toast.success("تم تعديل المورد بنجاح");
      onSubmit();
    } catch (error: any) {
      console.error("خطأ في تعديل المورد:", error);
      toast.error(error.message || "حدث خطأ أثناء تعديل المورد");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    budgetItems,
    useDefaultPercentages,
    totalAmount,
    obligationsAmount,
    source,
    type,
    entity,
    isLoading,
    totalPercentage,
    isValidPercentages,
    handleTotalAmountChange,
    handleObligationsChange,
    handleSourceChange,
    handleUseDefaultsChange,
    handleItemPercentageChange,
    handleSubmit
  };
};
