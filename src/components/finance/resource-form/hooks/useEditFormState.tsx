
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
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

export const useEditFormState = (
  resource: Resource,
  budgetItems: BudgetItem[],
  setBudgetItems: React.Dispatch<React.SetStateAction<BudgetItem[]>>,
  useDefaultPercentages: boolean,
  setUseDefaultPercentages: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const [totalAmount, setTotalAmount] = useState<number>(resource.total_amount);
  const [obligationsAmount, setObligationsAmount] = useState<number>(resource.obligations_amount);
  const [source, setSource] = useState(resource.source);
  const [type, setType] = useState(resource.type);
  const [entity, setEntity] = useState(resource.entity);

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
  }, [totalAmount, obligationsAmount, setBudgetItems, budgetItems.length]);

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

  return {
    totalAmount,
    obligationsAmount,
    source,
    type,
    entity,
    totalPercentage,
    isValidPercentages,
    handleTotalAmountChange,
    handleObligationsChange,
    handleSourceChange,
    handleUseDefaultsChange,
    handleItemPercentageChange
  };
};
