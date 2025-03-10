
import { formatDate } from "@/utils/dateUtils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusCircle, BarChart2 } from "lucide-react";
import { ObligationBalance } from "./hooks/useObligationBalances";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress"; 

interface ObligationBalancesTableProps {
  balances: ObligationBalance[];
  loading: boolean;
  onAddExpense: (obligationId: string, originalAmount: number, description: string) => void;
  onViewDetails: (obligationId: string, description: string) => void;
}

export const ObligationBalancesTable = ({ 
  balances, 
  loading, 
  onAddExpense,
  onViewDetails 
}: ObligationBalancesTableProps) => {
  if (loading) {
    return <div className="text-center p-4">جاري تحميل البيانات...</div>;
  }

  return (
    <div className="border rounded-md overflow-hidden">
      {balances.length === 0 ? (
        <div className="text-center p-8 text-muted-foreground">
          لا توجد بيانات أرصدة التزامات متاحة
        </div>
      ) : (
        <Table dir="rtl">
          <TableHeader>
            <TableRow>
              <TableHead>المصدر</TableHead>
              <TableHead>التاريخ</TableHead>
              <TableHead>الإيضاح</TableHead>
              <TableHead>المبلغ الأصلي</TableHead>
              <TableHead>المبلغ المصروف</TableHead>
              <TableHead>الرصيد المتبقي</TableHead>
              <TableHead>نسبة الصرف</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {balances.map((balance) => (
              <TableRow key={balance.obligation_id}>
                <TableCell>{balance.resource_source}</TableCell>
                <TableCell>{formatDate(balance.resource_date)}</TableCell>
                <TableCell>{balance.description || "—"}</TableCell>
                <TableCell>{balance.original_amount.toLocaleString()} ريال</TableCell>
                <TableCell>{balance.spent_amount.toLocaleString()} ريال</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {balance.remaining_balance.toLocaleString()} ريال
                    <Badge 
                      variant={
                        balance.remaining_balance <= 0 
                          ? "destructive" 
                          : balance.spending_percentage > 90 
                            ? "outline" 
                            : "secondary"
                      }
                    >
                      {balance.remaining_balance <= 0 
                        ? "تم استنفاذه" 
                        : balance.spending_percentage > 90 
                          ? "شبه منتهي" 
                          : "متاح"}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="w-full">
                    <div className="flex justify-between text-xs mb-1">
                      <span>{Math.round(balance.spending_percentage)}%</span>
                    </div>
                    <Progress 
                      value={balance.spending_percentage} 
                      className="h-2" 
                      indicatorClassName={
                        balance.spending_percentage > 90 
                          ? "bg-destructive" 
                          : balance.spending_percentage > 70 
                            ? "bg-amber-500" 
                            : "bg-emerald-500"
                      }
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2 space-x-reverse">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onAddExpense(
                        balance.obligation_id, 
                        balance.original_amount, 
                        balance.description
                      )}
                    >
                      <PlusCircle className="h-4 w-4 ml-1" />
                      <span>صرف</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onViewDetails(
                        balance.obligation_id, 
                        balance.description
                      )}
                    >
                      <BarChart2 className="h-4 w-4 ml-1" />
                      <span>تفاصيل</span>
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
