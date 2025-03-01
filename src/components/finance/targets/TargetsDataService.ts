
import { supabase } from "@/integrations/supabase/client";

export type FinancialTarget = {
  id: string;
  year: number;
  quarter: number;
  type: string;
  target_amount: number;
  actual_amount: number;
  budget_item_id?: string;
  resource_source?: string;
};

export type BudgetItem = {
  id: string;
  name: string;
};

export async function fetchTargets(): Promise<FinancialTarget[]> {
  const { data, error } = await supabase
    .from("financial_targets")
    .select("*")
    .order("year", { ascending: false })
    .order("quarter", { ascending: true })
    .order("type", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function fetchBudgetItems(): Promise<BudgetItem[]> {
  const { data, error } = await supabase
    .from("budget_items")
    .select("id, name");

  if (error) throw error;
  return data || [];
}

export async function addTarget(target: Omit<FinancialTarget, "id">) {
  const { data, error } = await supabase
    .from("financial_targets")
    .insert([{
      year: target.year,
      quarter: target.quarter,
      type: target.type,
      target_amount: target.target_amount,
      actual_amount: target.actual_amount || 0,
      budget_item_id: target.budget_item_id || null,
      resource_source: target.resource_source || null,
    }])
    .select();

  if (error) throw error;
  return data;
}

export async function updateTarget(id: string, target: Omit<FinancialTarget, "id">) {
  const { error } = await supabase
    .from("financial_targets")
    .update({
      year: target.year,
      quarter: target.quarter,
      type: target.type,
      target_amount: target.target_amount,
      actual_amount: target.actual_amount || 0,
      budget_item_id: target.budget_item_id || null,
      resource_source: target.resource_source || null,
    })
    .eq("id", id);

  if (error) throw error;
}

export async function deleteTarget(id: string) {
  const { error } = await supabase
    .from("financial_targets")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function fetchResourcesData() {
  const { data, error } = await supabase
    .from("financial_resources")
    .select("net_amount, date, source");
  
  if (error) throw error;
  return data || [];
}

export async function fetchExpensesData() {
  const { data, error } = await supabase
    .from("expenses")
    .select("budget_item_id, amount, date");
  
  if (error) throw error;
  return data || [];
}

export async function updateActualAmounts(targetsData: FinancialTarget[]): Promise<FinancialTarget[]> {
  try {
    // جلب الموارد
    const resourcesData = await fetchResourcesData();
    
    // جلب المصروفات
    const expensesData = await fetchExpensesData();
    
    // تحديث البيانات المتحققة لكل مستهدف
    const updatedTargets = targetsData.map(target => {
      const targetYear = target.year;
      let actualAmount = 0;
      
      // تحديد الشهور بناءً على الربع أو إذا كان سنويًا
      let months: number[] = [];
      if (target.quarter === 0) {
        // مستهدف سنوي: جميع الشهور
        months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      } else {
        // مستهدف ربعي
        const quarterMonths = {
          1: [1, 2, 3],
          2: [4, 5, 6],
          3: [7, 8, 9],
          4: [10, 11, 12]
        };
        months = quarterMonths[target.quarter as 1 | 2 | 3 | 4];
      }
      
      if (target.type === "موارد" && resourcesData) {
        // حساب مجموع الموارد في هذه الفترة
        resourcesData.forEach(resource => {
          const resourceDate = new Date(resource.date);
          const resourceYear = resourceDate.getFullYear();
          const resourceMonth = resourceDate.getMonth() + 1;
          
          if (resourceYear === targetYear && months.includes(resourceMonth)) {
            // إذا كان هناك تحديد لمصدر محدد للمورد، نأخذ فقط الموارد من نفس المصدر
            if (target.resource_source) {
              if (resource.source === target.resource_source) {
                actualAmount += Number(resource.net_amount);
              }
            } else {
              // إذا لم يكن هناك تحديد لمصدر، نجمع كل الموارد
              actualAmount += Number(resource.net_amount);
            }
          }
        });
      } else if (target.type === "مصروفات" && expensesData) {
        // حساب مجموع المصروفات في هذه الفترة
        expensesData.forEach(expense => {
          const expenseDate = new Date(expense.date);
          const expenseYear = expenseDate.getFullYear();
          const expenseMonth = expenseDate.getMonth() + 1;
          
          if (expenseYear === targetYear && months.includes(expenseMonth)) {
            if (target.budget_item_id) {
              // إذا كان المستهدف مرتبط ببند ميزانية، نجمع فقط المصروفات المرتبطة بنفس البند
              if (expense.budget_item_id === target.budget_item_id) {
                actualAmount += Number(expense.amount);
              }
            } else {
              // إذا كان المستهدف عام (بدون بند ميزانية)، نجمع كل المصروفات
              actualAmount += Number(expense.amount);
            }
          }
        });
      }
      
      return { ...target, actual_amount: actualAmount };
    });
    
    return updatedTargets;
  } catch (error) {
    console.error("Error updating actual amounts:", error);
    return targetsData;
  }
}
