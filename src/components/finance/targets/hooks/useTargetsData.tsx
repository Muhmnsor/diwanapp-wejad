
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  FinancialTarget, 
  BudgetItem, 
  fetchTargets, 
  fetchBudgetItems, 
  updateActualAmounts 
} from "../TargetsDataService";

export function useTargetsData() {
  const [targets, setTargets] = useState<FinancialTarget[]>([]);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadTargets(),
        loadBudgetItems()
      ]);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadTargets = async () => {
    try {
      const targetsData = await fetchTargets();
      
      // بعد جلب المستهدفات، نحدّث القيم المتحققة من قاعدة البيانات
      if (targetsData.length > 0) {
        const updatedTargets = await updateActualAmounts(targetsData);
        setTargets(updatedTargets);
      } else {
        setTargets([]);
      }
    } catch (error) {
      console.error("Error fetching targets:", error);
      toast.error("حدث خطأ أثناء جلب المستهدفات المالية");
    }
  };

  const loadBudgetItems = async () => {
    try {
      const items = await fetchBudgetItems();
      setBudgetItems(items);
    } catch (error) {
      console.error("Error fetching budget items:", error);
    }
  };

  return {
    targets,
    setTargets,
    budgetItems,
    loading,
    loadTargets
  };
}
