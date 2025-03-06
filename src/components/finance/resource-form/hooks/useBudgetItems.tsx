
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BudgetItem } from "../types";

export const useBudgetItems = () => {
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [useDefaultPercentages, setUseDefaultPercentages] = useState(true);

  // Fetch budget items on component mount
  useEffect(() => {
    const fetchBudgetItems = async () => {
      try {
        const { data, error } = await supabase
          .from("budget_items")
          .select("*")
          .order("name");

        if (error) {
          throw error;
        }

        if (data) {
          setBudgetItems(
            data.map((item) => ({
              id: item.id,
              name: item.name,
              percentage: item.default_percentage,
              value: 0,
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching budget items:", error);
        toast.error("حدث خطأ أثناء جلب بنود الميزانية");
      }
    };

    fetchBudgetItems();
  }, []);

  // Calculate values for budget items based on percentages
  const calculateValues = (
    totalAmount: number,
    obligationsAmount: number,
    useDefaults: boolean
  ): BudgetItem[] => {
    const netAmount = totalAmount - obligationsAmount;

    if (useDefaults) {
      // Use default percentages
      return budgetItems.map((item) => ({
        ...item,
        value: parseFloat(((netAmount * item.percentage) / 100).toFixed(2)),
      }));
    } else {
      // Use custom percentages
      return budgetItems.map((item) => ({
        ...item,
        value: parseFloat(((netAmount * item.percentage) / 100).toFixed(2)),
      }));
    }
  };

  // Handle toggling between default and custom percentages
  const handleUseDefaultsChange = (
    value: string,
    totalAmount: number,
    obligationsAmount: number
  ) => {
    const useDefaults = value === "default";
    setUseDefaultPercentages(useDefaults);

    if (useDefaults) {
      // Reset to default percentages
      const fetchDefaultPercentages = async () => {
        try {
          const { data, error } = await supabase
            .from("budget_items")
            .select("*")
            .order("name");

          if (error) throw error;
          
          if (data) {
            const items = data.map((item: any) => ({
              id: item.id,
              name: item.name,
              percentage: item.default_percentage,
              value: parseFloat(
                (
                  ((totalAmount - obligationsAmount) * item.default_percentage) /
                  100
                ).toFixed(2)
              ),
            }));
            setBudgetItems(items);
          }
        } catch (error) {
          console.error("Error fetching default percentages:", error);
          toast.error("حدث خطأ أثناء استعادة النسب الافتراضية");
        }
      };
      
      fetchDefaultPercentages();
    }
  };

  // Handle changing a budget item's percentage
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

    // Calculate the new values based on the updated percentages
    const newItemsWithValues = newItems.map((item) => ({
      ...item,
      value: parseFloat(
        (((totalAmount - obligationsAmount) * item.percentage) / 100).toFixed(2)
      ),
    }));

    setBudgetItems(newItemsWithValues);
  };

  return {
    budgetItems,
    setBudgetItems,
    useDefaultPercentages,
    calculateValues,
    handleUseDefaultsChange,
    handleItemPercentageChange,
  };
};
