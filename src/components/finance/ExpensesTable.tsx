
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Expense {
  id: string;
  date: string;
  budget_item: {
    id: string;
    name: string;
  };
  amount: number;
  description: string;
  beneficiary: string | null;
}

export const ExpensesTable = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('expenses')
        .select(`
          id,
          date,
          amount,
          description,
          beneficiary,
          budget_item:budget_item_id (id, name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setExpenses(data || []);
    } catch (error: any) {
      console.error("Error fetching expenses:", error);
      toast.error("حدث خطأ أثناء جلب بيانات المصروفات");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المصروف؟")) return;
    
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success("تم حذف المصروف بنجاح");
      fetchExpenses(); // إعادة تحميل البيانات
    } catch (error: any) {
      console.error("Error deleting expense:", error);
      toast.error("حدث خطأ أثناء حذف المصروف");
    }
  };

  if (isLoading) {
    return <div className="text-center p-4">جاري تحميل البيانات...</div>;
  }

  return (
    <div className="relative w-full overflow-auto">
      {expenses.length === 0 ? (
        <div className="text-center p-8 text-muted-foreground">
          لا توجد مصروفات مضافة حتى الآن
        </div>
      ) : (
        <Table dir="rtl">
          <TableHeader>
            <TableRow>
              <TableHead>التاريخ</TableHead>
              <TableHead>البند</TableHead>
              <TableHead>المبلغ</TableHead>
              <TableHead>الوصف</TableHead>
              <TableHead>المستفيد</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell>
                  {new Date(expense.date).toLocaleDateString("ar-SA")}
                </TableCell>
                <TableCell>{expense.budget_item.name}</TableCell>
                <TableCell>{expense.amount.toLocaleString()} ريال</TableCell>
                <TableCell>{expense.description}</TableCell>
                <TableCell>{expense.beneficiary || "-"}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {/* <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button> */}
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(expense.id)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};
