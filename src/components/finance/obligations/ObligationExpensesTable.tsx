
import { formatDate } from "@/utils/dateUtils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ObligationExpense } from "./hooks/useObligationExpenses";

interface ObligationExpensesTableProps {
  expenses: ObligationExpense[];
  loading: boolean;
}

export const ObligationExpensesTable = ({ expenses, loading }: ObligationExpensesTableProps) => {
  if (loading) {
    return <div className="text-center p-4">جاري تحميل البيانات...</div>;
  }

  return (
    <div className="border rounded-md">
      {expenses.length === 0 ? (
        <div className="text-center p-8 text-muted-foreground">
          لا توجد مصروفات مسجلة لهذا الالتزام
        </div>
      ) : (
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
      )}
    </div>
  );
};
