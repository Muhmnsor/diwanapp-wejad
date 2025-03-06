
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
import { useToast } from "@/hooks/use-toast";
import { DeleteExpenseDialog } from "./DeleteExpenseDialog";

export const ExpensesTable = () => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [budgetItems, setBudgetItems] = useState<{id: string; name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchExpenses();
  }, []);

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
      toast({
        title: "حدث خطأ أثناء تحميل المصروفات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getBudgetItemName = (budgetItemId: string) => {
    const item = budgetItems.find((item) => item.id === budgetItemId);
    return item ? item.name : "غير محدد";
  };

  const handleDeleteClick = (expense: any) => {
    setSelectedExpense(expense);
    setIsDeleteDialogOpen(true);
  };

  const deleteExpense = async () => {
    if (!selectedExpense) return;

    try {
      const { error } = await supabase
        .from("expenses")
        .delete()
        .eq("id", selectedExpense.id);

      if (error) throw error;

      // Remove the expense from the local state
      setExpenses(expenses.filter(expense => expense.id !== selectedExpense.id));
      
      toast({
        title: "تم حذف المصروف بنجاح",
        variant: "default",
      });
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast({
        title: "حدث خطأ أثناء حذف المصروف",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedExpense(null);
    }
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
            <TableHead className="text-right">الوصف</TableHead>
            <TableHead className="text-right">البند</TableHead>
            <TableHead className="text-right">المستفيد</TableHead>
            <TableHead className="text-right">المبلغ</TableHead>
            <TableHead className="text-right">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                لا توجد مصروفات مسجلة بعد
              </TableCell>
            </TableRow>
          ) : (
            expenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell>{formatDate(expense.date)}</TableCell>
                <TableCell>{expense.description}</TableCell>
                <TableCell>{getBudgetItemName(expense.budget_item_id)}</TableCell>
                <TableCell>{expense.beneficiary || "غير محدد"}</TableCell>
                <TableCell>{expense.amount.toLocaleString()} ريال</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive"
                      onClick={() => handleDeleteClick(expense)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {selectedExpense && (
        <DeleteExpenseDialog
          isOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={deleteExpense}
          expenseId={selectedExpense.id}
          description={selectedExpense.description}
        />
      )}
    </div>
  );
};
