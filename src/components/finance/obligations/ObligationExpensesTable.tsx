
import { formatDate } from "@/utils/dateUtils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { ObligationExpense } from "./hooks/useObligationExpenses";

interface ObligationExpensesTableProps {
  expenses: ObligationExpense[];
  loading: boolean;
  totalSpent?: number;
  originalAmount?: number;
}

export const ObligationExpensesTable = ({ 
  expenses, 
  loading, 
  totalSpent,
  originalAmount
}: ObligationExpensesTableProps) => {
  if (loading) {
    return <div className="text-center p-4">جاري تحميل البيانات...</div>;
  }

  // Calculate spending percentage if both values are provided
  const spendingPercentage = originalAmount && totalSpent 
    ? Math.min(Math.round((totalSpent / originalAmount) * 100), 100) 
    : undefined;

  return (
    <div className="border rounded-md">
      {expenses.length === 0 ? (
        <div className="text-center p-8 text-muted-foreground">
          لا توجد مصروفات مسجلة لهذا الالتزام
        </div>
      ) : (
        <>
          {originalAmount && totalSpent !== undefined && (
            <div className="p-4 border-b bg-muted/30">
              <div className="flex justify-between mb-1 text-sm">
                <span>إجمالي المصروفات: {totalSpent.toLocaleString()} ريال</span>
                <span>{spendingPercentage}%</span>
              </div>
              <Progress 
                value={spendingPercentage} 
                className="h-2"
                indicatorClassName={
                  spendingPercentage > 90 
                    ? "bg-destructive" 
                    : spendingPercentage > 70 
                      ? "bg-amber-500" 
                      : "bg-emerald-500"
                }
              />
            </div>
          )}
          
          <Table dir="rtl">
            <TableHeader>
              <TableRow>
                <TableHead>التاريخ</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead>الوصف</TableHead>
                <TableHead>المستفيد</TableHead>
                <TableHead>المستند المرجعي</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{formatDate(expense.date)}</TableCell>
                  <TableCell>{expense.amount.toLocaleString()} ريال</TableCell>
                  <TableCell>{expense.description}</TableCell>
                  <TableCell>{expense.beneficiary || "—"}</TableCell>
                  <TableCell>{expense.reference_document || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}
    </div>
  );
};
