
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";

type FinancialTarget = {
  id: string;
  year: number;
  quarter: number;
  type: string;
  target_amount: number;
  actual_amount: number;
  budget_item_id?: string;
};

type TargetsTableProps = {
  targets: FinancialTarget[];
  loading: boolean;
  onEdit: (target: FinancialTarget) => void;
  onDelete: (id: string) => void;
};

export const TargetsTable = ({ targets, loading, onEdit, onDelete }: TargetsTableProps) => {
  const getAchievementPercentage = (target: number, actual: number) => {
    if (target === 0) return 0;
    return Math.round((actual / target) * 100);
  };

  const getAchievementColor = (percentage: number) => {
    if (percentage >= 100) return "text-green-600";
    if (percentage >= 80) return "text-yellow-600";
    return "text-red-600";
  };

  if (loading) {
    return <div className="text-center py-4">جاري تحميل البيانات...</div>;
  }

  if (targets.length === 0) {
    return <div className="text-center py-4 text-muted-foreground">لا توجد مستهدفات مالية مسجلة</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-right">السنة</TableHead>
          <TableHead className="text-right">الربع</TableHead>
          <TableHead className="text-right">النوع</TableHead>
          <TableHead className="text-right">المستهدف</TableHead>
          <TableHead className="text-right">المتحقق</TableHead>
          <TableHead className="text-right">نسبة التحقيق</TableHead>
          <TableHead className="text-right">الإجراءات</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {targets.map((target) => (
          <TableRow key={target.id}>
            <TableCell>{target.year}</TableCell>
            <TableCell>{target.quarter}</TableCell>
            <TableCell>{target.type}</TableCell>
            <TableCell>{target.target_amount.toLocaleString()} ريال</TableCell>
            <TableCell>{target.actual_amount.toLocaleString()} ريال</TableCell>
            <TableCell className={getAchievementColor(getAchievementPercentage(target.target_amount, target.actual_amount))}>
              {getAchievementPercentage(target.target_amount, target.actual_amount)}%
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => onEdit(target)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-destructive"
                  onClick={() => onDelete(target.id)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
