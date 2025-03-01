
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BudgetItem {
  id: string;
  name: string;
  percentage: number;
  allocated: number;
  spent: number;
  remaining: number;
}

export const BudgetItemsTable = () => {
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBudgetItemsData();
  }, []);

  const fetchBudgetItemsData = async () => {
    try {
      setIsLoading(true);
      
      // 1. جلب بنود الميزانية
      const { data: itemsData, error: itemsError } = await supabase
        .from('budget_items')
        .select('id, name, default_percentage');
      
      if (itemsError) throw itemsError;
      
      // 2. جلب المصروفات لكل بند
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('budget_item_id, amount');
      
      if (expensesError) throw expensesError;
      
      // 3. جلب الموارد الموزعة على البنود
      const { data: distributionsData, error: distributionsError } = await supabase
        .from('resource_distributions')
        .select('budget_item_id, amount');
      
      if (distributionsError) throw distributionsError;
      
      // حساب المبالغ المخصصة والمصروفة لكل بند
      const budgetItemsWithAmounts = itemsData.map(item => {
        // حساب إجمالي المخصص للبند من الموارد الموزعة
        const allocated = distributionsData
          .filter(dist => dist.budget_item_id === item.id)
          .reduce((sum, dist) => sum + dist.amount, 0);
        
        // حساب إجمالي المصروفات من هذا البند
        const spent = expensesData
          .filter(exp => exp.budget_item_id === item.id)
          .reduce((sum, exp) => sum + exp.amount, 0);
        
        // حساب المتبقي
        const remaining = allocated - spent;
        
        return {
          id: item.id,
          name: item.name,
          percentage: item.default_percentage,
          allocated,
          spent,
          remaining
        };
      });
      
      setBudgetItems(budgetItemsWithAmounts);
    } catch (error) {
      console.error("Error fetching budget items data:", error);
      toast.error("حدث خطأ أثناء جلب بيانات البنود");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-center p-4">جاري تحميل البيانات...</div>;
  }

  return (
    <div className="relative w-full overflow-auto">
      <Table dir="rtl">
        <TableHeader>
          <TableRow>
            <TableHead>البند</TableHead>
            <TableHead>النسبة</TableHead>
            <TableHead>المخصص</TableHead>
            <TableHead>المصروف</TableHead>
            <TableHead>المتبقي</TableHead>
            <TableHead>نسبة الاستهلاك</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {budgetItems.map((item) => {
            // حساب نسبة الاستهلاك
            const spentPercentage = item.allocated > 0 
              ? Math.round((item.spent / item.allocated) * 100)
              : 0;
            
            // تحديد لون نسبة الاستهلاك بناءً على قيمتها
            let progressColor = "bg-green-500";
            if (spentPercentage > 75) progressColor = "bg-red-500";
            else if (spentPercentage > 50) progressColor = "bg-yellow-500";
            
            return (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.percentage}%</TableCell>
                <TableCell>{item.allocated.toLocaleString()} ريال</TableCell>
                <TableCell>{item.spent.toLocaleString()} ريال</TableCell>
                <TableCell>{item.remaining.toLocaleString()} ريال</TableCell>
                <TableCell className="w-[200px]">
                  <div className="flex items-center gap-2">
                    <Progress value={spentPercentage} className={progressColor} />
                    <span className="text-xs">{spentPercentage}%</span>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
