
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
          <TableRow>
            <TableHead className="text-right">التاريخ</TableHead>
            <TableHead className="text-right">العنوان</TableHead>
            <TableHead className="text-right">البند</TableHead>
            <TableHead className="text-right">المبلغ</TableHead>
            <TableHead className="text-right">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                لا توجد مصروفات مسجلة بعد
              </TableCell>
            </TableRow>
          ) : (
            expenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell>{new Date(expense.date).toLocaleDateString("ar-SA")}</TableCell>
                <TableCell>{expense.title}</TableCell>
                <TableCell>{getBudgetItemName(expense.budget_item_id)}</TableCell>
                <TableCell>{expense.amount.toLocaleString()} ريال</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive">
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
