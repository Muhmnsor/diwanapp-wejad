
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/utils/dateUtils";

export const ExpensesTable = () => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [budgetItems, setBudgetItems] = useState<{id: string; name: string}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpenses = async () => {
      setLoading(true);
      try {
        const { data: expensesData, error: expensesError } = await supabase
          .from("expenses")
          .select("*, budget_item_id");

        if (expensesError) throw expensesError;

        const { data: budgetItemsData, error: budgetItemsError } = await supabase
          .from("budget_items")
          .select("id, name");

        if (budgetItemsError) throw budgetItemsError;

        setExpenses(expensesData || []);
        setBudgetItems(budgetItemsData || []);
      } catch (error) {
        console.error("Error fetching expenses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  const getBudgetItemName = (budgetItemId: string) => {
    const item = budgetItems.find((item) => item.id === budgetItemId);
    return item ? item.name : "غير محدد";
  };

  if (loading) {
    return <div className="text-center py-4">جاري التحميل...</div>;
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="text-center py-4 text-gray-700 font-semibold">التاريخ</TableHead>
            <TableHead className="text-center py-4 text-gray-700 font-semibold">الوصف</TableHead>
            <TableHead className="text-center py-4 text-gray-700 font-semibold">البند</TableHead>
            <TableHead className="text-center py-4 text-gray-700 font-semibold">المستفيد</TableHead>
            <TableHead className="text-center py-4 text-gray-700 font-semibold">المبلغ</TableHead>
            <TableHead className="text-center py-4 text-gray-700 font-semibold">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                لا توجد مصروفات مسجلة بعد
              </TableCell>
            </TableRow>
          ) : (
            expenses.map((expense) => (
              <TableRow 
                key={expense.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <TableCell className="text-center py-4 text-gray-700">{formatDate(expense.date)}</TableCell>
                <TableCell className="text-center py-4 text-gray-700">{expense.description}</TableCell>
                <TableCell className="text-center py-4 text-gray-700">{getBudgetItemName(expense.budget_item_id)}</TableCell>
                <TableCell className="text-center py-4 text-gray-700">{expense.beneficiary || "غير محدد"}</TableCell>
                <TableCell className="text-center py-4 text-gray-700">{expense.amount.toLocaleString()} ريال</TableCell>
                <TableCell className="text-center py-4">
                  <div className="flex gap-2 justify-center">
                    <Button variant="outline" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="text-destructive">
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
