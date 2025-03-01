
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { BudgetItem } from "./types";

export const useResourceForm = (onSubmit: () => void) => {
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [useDefaultPercentages, setUseDefaultPercentages] = useState(true);
  const [totalAmount, setTotalAmount] = useState<number | "">("");
  const [obligationsAmount, setObligationsAmount] = useState<number | "">(0);
  const [source, setSource] = useState("منصات التمويل الجماعي");
  const [isLoading, setIsLoading] = useState(false);

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

  // Handle total amount change
  const handleTotalAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === "" ? "" : parseFloat(e.target.value);
    setTotalAmount(value);
    
    if (typeof value === "number" && !isNaN(value)) {
      const obligations = typeof obligationsAmount === "number" ? obligationsAmount : 0;
      setBudgetItems(calculateValues(value, obligations, useDefaultPercentages));
    }
  };

  // Handle obligations amount change
  const handleObligationsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === "" ? 0 : parseFloat(e.target.value);
    setObligationsAmount(value);
    
    if (typeof totalAmount === "number") {
      setBudgetItems(calculateValues(totalAmount, value, useDefaultPercentages));
    }
  };

  // Handle source change
  const handleSourceChange = (value: string) => {
    setSource(value);
  };

  // Handle percentage type change (default or manual)
  const handleUseDefaultsChange = (value: string) => {
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
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newPercentage = parseFloat(e.target.value);
    if (isNaN(newPercentage)) return;

    const newItems = budgetItems.map((item) =>
      item.id === id ? { ...item, percentage: newPercentage } : item
    );
    
    setBudgetItems(newItems);
    
    // Calculate values based on new percentages
    if (typeof totalAmount === "number") {
      const obligations = typeof obligationsAmount === "number" ? obligationsAmount : 0;
      const netAmount = totalAmount - obligations;
      
      setBudgetItems(
        newItems.map((item) => ({
          ...item,
          value: parseFloat(((netAmount * item.percentage) / 100).toFixed(2)),
        }))
      );
    }
  };

  // Calculate total percentage
  const totalPercentage = budgetItems.reduce(
    (sum, item) => sum + item.percentage,
    0
  );

  // Check if percentages are valid
  const isValidPercentages = Math.round(totalPercentage) === 100;

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required data
    if (typeof totalAmount !== "number" || totalAmount <= 0) {
      toast.error("الرجاء إدخال مبلغ إجمالي صحيح");
      return;
    }
    
    // Validate percentages if manual entry
    if (!useDefaultPercentages && !isValidPercentages) {
      toast.error("مجموع النسب المئوية يجب أن يكون 100%");
      return;
    }

    setIsLoading(true);
    
    try {
      const type = (document.getElementById("type") as HTMLSelectElement)?.value;
      const entity = (document.getElementById("entity") as HTMLInputElement).value;
      const netAmount = totalAmount - (typeof obligationsAmount === "number" ? obligationsAmount : 0);
      
      // 1. Add financial resource
      const { data: resourceData, error: resourceError } = await supabase
        .from('financial_resources')
        .insert({
          date: new Date().toISOString().split("T")[0],
          source,
          type,
          entity,
          total_amount: totalAmount,
          obligations_amount: typeof obligationsAmount === "number" ? obligationsAmount : 0,
          net_amount: netAmount
        })
        .select();

      if (resourceError) throw resourceError;
      
      if (!resourceData || resourceData.length === 0) {
        throw new Error('لم يتم إنشاء المورد بنجاح');
      }
      
      const resourceId = resourceData[0].id;
      
      // 2. Add budget item distributions
      const distributions = budgetItems.map(item => ({
        resource_id: resourceId,
        budget_item_id: item.id,
        percentage: item.percentage,
        amount: item.value
      }));
      
      const { error: distributionError } = await supabase
        .from('resource_distributions')
        .insert(distributions);
      
      if (distributionError) throw distributionError;
      
      toast.success("تم إضافة المورد بنجاح");
      onSubmit();
    } catch (error: any) {
      console.error("خطأ في حفظ المورد:", error);
      toast.error(error.message || "حدث خطأ أثناء حفظ المورد");
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
    isLoading,
    totalPercentage,
    isValidPercentages,
    handleTotalAmountChange,
    handleObligationsChange,
    handleSourceChange,
    handleUseDefaultsChange,
    handleItemPercentageChange,
    handleSubmit,
  };
};
