
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { BudgetItem } from "../types";

export const useBudgetItems = () => {
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [useDefaultPercentages, setUseDefaultPercentages] = useState(true);

  // Fetch budget items from the database
  useEffect(() => {
    const fetchBudgetItems = async () => {
      try {
        const { data, error } = await supabase
          .from('budget_items')
          .select('id, name, default_percentage');

        if (error) {
          throw error;
        }

        if (data) {
          const items = data.map(item => ({
            id: item.id,
            name: item.name,
            percentage: item.default_percentage,
            value: 0
          }));
          setBudgetItems(items);
        }
      } catch (error) {
        console.error('Error fetching budget items:', error);
        toast.error('حدث خطأ أثناء جلب بنود الميزانية');
      }
    };

    fetchBudgetItems();
  }, []);

  // Calculate values based on percentages and total amount
  const calculateValues = (
    total: number,
    obligations: number,
    useDefaults: boolean
  ) => {
    const netAmount = total - obligations;
    
    return budgetItems.map((item) => ({
      ...item,
      percentage: useDefaults ? item.percentage : item.percentage,
      value: useDefaults
        ? parseFloat(((netAmount * item.percentage) / 100).toFixed(2))
        : 0,
    }));
  };

  // Handle percentage type change (default or manual)
  const handleUseDefaultsChange = (value: string, totalAmount: number, obligationsAmount: number) => {
    const useDefaults = value === "default";
    setUseDefaultPercentages(useDefaults);
    
    if (typeof totalAmount === "number") {
      const obligations = typeof obligationsAmount === "number" ? obligationsAmount : 0;
      setBudgetItems(calculateValues(totalAmount, obligations, useDefaults));
    }
  };

  // Handle item percentage change
  const handleItemPercentageChange = (
    id: string,
    e: React.ChangeEvent<HTMLInputElement>,
    totalAmount: number,
    obligationsAmount: number
  ) => {
    const newPercentage = parseFloat(e.target.value);
    if (isNaN(newPercentage)) return;

    const newItems = budgetItems.map((item) =>
      item.id === id ? { ...item, percentage: newPercentage } : item
    );
    
    // Calculate values based on new percentages
    if (typeof totalAmount === "number") {
      const obligations = typeof obligationsAmount === "number" ? obligationsAmount : 0;
      const netAmount = totalAmount - obligations;
      
      const updatedItems = newItems.map((item) => ({
        ...item,
        value: parseFloat(((netAmount * item.percentage) / 100).toFixed(2)),
      }));
      
      setBudgetItems(updatedItems);
    }
  };

  return {
    budgetItems,
    setBudgetItems,
    useDefaultPercentages,
    calculateValues,
    handleUseDefaultsChange,
    handleItemPercentageChange
  };
};
