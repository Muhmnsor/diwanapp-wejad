
import { useState, useEffect } from "react";
import { fetchTargets, updateActualAmounts } from "../../targets/TargetsDataService";
import { supabase } from "@/integrations/supabase/client";

export const useFinancialData = () => {
  const [financialData, setFinancialData] = useState({
    totalResources: 0,
    totalExpenses: 0,
    resourcesTarget: 0,
    resourcesPercentage: 0,
    resourcesRemaining: 0,
    currentYear: new Date().getFullYear(),
    resourcesData: [],
    expensesData: []
  });
  const [loading, setLoading] = useState(true);
  const [comparisonData, setComparisonData] = useState<any[]>([]);

  useEffect(() => {
    loadFinancialData();
  }, []);

  const loadFinancialData = async () => {
    try {
      setLoading(true);
      
      // Fetch targets data
      const targetsData = await fetchTargets();
      const updatedTargets = await updateActualAmounts(targetsData);
      
      // Filter for current year
      const currentYear = new Date().getFullYear();
      const currentYearTargets = updatedTargets.filter(target => target.year === currentYear);
      
      // Split by type
      const resourceTargets = currentYearTargets.filter(target => target.type === "موارد");
      const expenseTargets = currentYearTargets.filter(target => target.type === "مصروفات");
      
      // Calculate totals
      const totalResources = resourceTargets.reduce((sum, target) => sum + target.actual_amount, 0);
      const totalExpenses = expenseTargets.reduce((sum, target) => sum + target.actual_amount, 0);
      const resourcesTarget = resourceTargets.reduce((sum, target) => sum + target.target_amount, 0);
      const resourcesPercentage = resourcesTarget > 0 ? Math.round((totalResources / resourcesTarget) * 100) : 0;
      const resourcesRemaining = resourcesTarget - totalResources > 0 ? resourcesTarget - totalResources : 0;
      
      // Fetch resources data
      const { data: resourcesData, error: resourcesError } = await supabase
        .from('financial_resources')
        .select('*')
        .order('date', { ascending: false });
      
      if (resourcesError) throw resourcesError;
      
      // Fetch expenses data
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('*, budget_items(name)')
        .order('date', { ascending: false });
      
      if (expensesError) throw expensesError;
      
      // Process expenses data to include budget_item_name
      const processedExpensesData = expensesData.map(expense => ({
        ...expense,
        budget_item_name: expense.budget_items?.name || 'غير محدد'
      }));
      
      setFinancialData({
        totalResources,
        totalExpenses,
        resourcesTarget,
        resourcesPercentage,
        resourcesRemaining,
        currentYear,
        resourcesData: resourcesData || [],
        expensesData: processedExpensesData || []
      });

      // Prepare data for comparison chart
      // Group expenses by quarter
      const expensesByQuarter = {};
      const targetsByQuarter = {};
      
      for (const target of currentYearTargets) {
        const quarter = target.period_type === 'yearly' ? 'السنوي' : `الربع ${target.quarter}`;
        
        if (!expensesByQuarter[quarter]) {
          expensesByQuarter[quarter] = 0;
          targetsByQuarter[quarter] = 0;
        }
        
        if (target.type === 'مصروفات') {
          expensesByQuarter[quarter] += target.actual_amount;
          targetsByQuarter[quarter] += target.target_amount;
        }
      }
      
      const chartData = Object.keys(expensesByQuarter).map(quarter => {
        const targetAmount = targetsByQuarter[quarter] || 0;
        const actualAmount = expensesByQuarter[quarter] || 0;
        const varianceAmount = targetAmount - actualAmount;
        
        return {
          name: quarter,
          target: targetAmount,
          actual: actualAmount,
          variance: varianceAmount
        };
      });
      
      setComparisonData(chartData);
    } catch (error) {
      console.error("Error loading financial data:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    financialData,
    loading,
    comparisonData,
    loadFinancialData
  };
};
