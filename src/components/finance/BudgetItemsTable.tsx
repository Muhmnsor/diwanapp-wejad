
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";

export const BudgetItemsTable = () => {
  const [budgetItems, setBudgetItems] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [totalBudget, setTotalBudget] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBudgetData = async () => {
      setLoading(true);
      try {
        // جلب بيانات البنود
        const { data: budgetItemsData, error: budgetItemsError } = await supabase
          .from("budget_items")
          .select("*");

        if (budgetItemsError) throw budgetItemsError;

        // جلب بيانات المصروفات
        const { data: expensesData, error: expensesError } = await supabase
          .from("expenses")
          .select("*");

        if (expensesError) throw expensesError;

        // جلب إجمالي الموارد
        const { data: resourcesData, error: resourcesError } = await supabase
          .from("financial_resources")
          .select("net_amount");

        if (resourcesError) throw resourcesError;

        // حساب إجمالي الموارد
        const totalResources = resourcesData.reduce(
          (sum, resource) => sum + resource.net_amount,
          0
        );

        setBudgetItems(budgetItemsData || []);
        setExpenses(expensesData || []);
        setTotalBudget(totalResources);
      } catch (error) {
        console.error("Error fetching budget data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBudgetData();
  }, []);

  // حساب المصروفات لكل بند
  const calculateExpensesByBudgetItem = (budgetItemId: string) => {
    return expenses
      .filter((expense) => expense.budget_item_id === budgetItemId)
      .reduce((sum, expense) => sum + expense.amount, 0);
  };

  // حساب رصيد كل بند
  const calculateBudgetItemBalance = (
    budgetItemId: string,
    defaultPercentage: number
  ) => {
    // المبلغ المخصص للبند بناءً على نسبته المئوية من إجمالي الموارد
    const allocatedAmount = (totalBudget * defaultPercentage) / 100;
    
    // إجمالي المصروفات على هذا البند
    const expensesAmount = calculateExpensesByBudgetItem(budgetItemId);
    
    // الرصيد المتبقي
    return allocatedAmount - expensesAmount;
  };

  // تنسيق المبالغ بإضافة فواصل الآلاف
  const formatAmount = (amount: number) => {
    return amount.toLocaleString();
  };

  if (loading) {
    return <div className="text-center py-4">جاري التحميل...</div>;
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="text-center py-4 text-gray-700 font-semibold">البند</TableHead>
            <TableHead className="text-center py-4 text-gray-700 font-semibold">النسبة المئوية</TableHead>
            <TableHead className="text-center py-4 text-gray-700 font-semibold">المبلغ المخصص</TableHead>
            <TableHead className="text-center py-4 text-gray-700 font-semibold">المصروفات</TableHead>
            <TableHead className="text-center py-4 text-gray-700 font-semibold">الرصيد</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {budgetItems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                لا توجد بنود مسجلة بعد
              </TableCell>
            </TableRow>
          ) : (
            budgetItems.map((item) => {
              const allocatedAmount = (totalBudget * item.default_percentage) / 100;
              const expensesAmount = calculateExpensesByBudgetItem(item.id);
              const balance = calculateBudgetItemBalance(
                item.id,
                item.default_percentage
              );
              return (
                <TableRow 
                  key={item.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <TableCell className="text-center py-4 text-gray-700">{item.name}</TableCell>
                  <TableCell className="text-center py-4 text-gray-700">{item.default_percentage}%</TableCell>
                  <TableCell className="text-center py-4 text-gray-700">{formatAmount(allocatedAmount)} ريال</TableCell>
                  <TableCell className="text-center py-4 text-gray-700">{formatAmount(expensesAmount)} ريال</TableCell>
                  <TableCell
                    className={
                      balance < 0 
                        ? "text-center py-4 text-red-500" 
                        : "text-center py-4 text-green-500"
                    }
                  >
                    {formatAmount(balance)} ريال
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};
