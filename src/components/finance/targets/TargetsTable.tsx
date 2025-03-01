
import React from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FinancialTarget } from "./TargetsDataService";
import { Pencil, Trash2 } from "lucide-react";

interface TargetsTableProps {
  targets: FinancialTarget[];
  loading: boolean;
  onEdit: (target: FinancialTarget) => void;
  onDelete: (id: string) => void;
  showResourceSource?: boolean;
  showBudgetItem?: boolean;
  budgetItems?: {id: string, name: string}[];
}

export const TargetsTable: React.FC<TargetsTableProps> = ({
  targets,
  loading,
  onEdit,
  onDelete,
  showResourceSource = false,
  showBudgetItem = false,
  budgetItems = [],
}) => {
  const formatNumber = (num: number) => {
    // Using English locale to ensure English numbers
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'SAR' }).format(num);
  };

  const calculatePercentage = (actual: number, target: number) => {
    if (target === 0) return 0;
    return Math.round((actual / target) * 100);
  };

  const getBudgetItemName = (itemId: string | undefined) => {
    if (!itemId) return "غير محدد";
    const item = budgetItems.find(item => item.id === itemId);
    return item ? item.name : "غير محدد";
  };

  // Calculate totals
  const calculateTotals = () => {
    return targets.reduce(
      (totals, target) => {
        return {
          targetAmount: totals.targetAmount + target.target_amount,
          actualAmount: totals.actualAmount + target.actual_amount,
        };
      },
      { targetAmount: 0, actualAmount: 0 }
    );
  };

  const totals = calculateTotals();
  const overallPercentage = calculatePercentage(totals.actualAmount, totals.targetAmount);

  if (loading) {
    return <div className="text-center py-4">جاري تحميل البيانات...</div>;
  }

  if (targets.length === 0) {
    return <div className="text-center py-4">لا توجد مستهدفات مالية</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-center">السنة</TableHead>
          <TableHead className="text-center">الفترة</TableHead>
          {showResourceSource && <TableHead className="text-center">نوع المورد</TableHead>}
          {showBudgetItem && <TableHead className="text-center">بند المصروفات</TableHead>}
          <TableHead className="text-center">المستهدف</TableHead>
          <TableHead className="text-center">المتحقق</TableHead>
          <TableHead className="text-center">نسبة التحقق</TableHead>
          <TableHead className="text-center">إجراءات</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {targets.map((target) => (
          <TableRow key={target.id}>
            <TableCell className="text-center">{target.year}</TableCell>
            <TableCell className="text-center">
              {target.period_type === "yearly" 
                ? "سنوي" 
                : `الربع ${target.quarter}`}
            </TableCell>
            {showResourceSource && (
              <TableCell className="text-center">{target.resource_source || "غير محدد"}</TableCell>
            )}
            {showBudgetItem && (
              <TableCell className="text-center">{getBudgetItemName(target.budget_item_id)}</TableCell>
            )}
            <TableCell className="text-center">{formatNumber(target.target_amount)}</TableCell>
            <TableCell className="text-center">{formatNumber(target.actual_amount)}</TableCell>
            <TableCell>
              <div className="flex items-center justify-center">
                <div className="w-24 h-2 bg-gray-200 rounded mr-2">
                  <div
                    className={`h-full rounded ${
                      calculatePercentage(target.actual_amount, target.target_amount) >= 100
                        ? "bg-green-500"
                        : calculatePercentage(target.actual_amount, target.target_amount) >= 75
                        ? "bg-yellow-400"
                        : "bg-red-500"
                    }`}
                    style={{
                      width: `${Math.min(
                        calculatePercentage(target.actual_amount, target.target_amount),
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
                <span dir="ltr">{calculatePercentage(target.actual_amount, target.target_amount)}%</span>
              </div>
            </TableCell>
            <TableCell className="text-center">
              <div className="flex space-x-2 space-x-reverse justify-center">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onEdit(target)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onDelete(target.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
        
        {/* Totals Row */}
        <TableRow className="font-bold bg-muted/50">
          <TableCell colSpan={showResourceSource || showBudgetItem ? 3 : 2} className="text-center">
            الإجمالي
          </TableCell>
          {showResourceSource && !showBudgetItem && <TableCell />}
          {!showResourceSource && showBudgetItem && <TableCell />}
          <TableCell className="text-center">{formatNumber(totals.targetAmount)}</TableCell>
          <TableCell className="text-center">{formatNumber(totals.actualAmount)}</TableCell>
          <TableCell>
            <div className="flex items-center justify-center">
              <div className="w-24 h-2 bg-gray-200 rounded mr-2">
                <div
                  className={`h-full rounded ${
                    overallPercentage >= 100
                      ? "bg-green-500"
                      : overallPercentage >= 75
                      ? "bg-yellow-400"
                      : "bg-red-500"
                  }`}
                  style={{
                    width: `${Math.min(overallPercentage, 100)}%`,
                  }}
                ></div>
              </div>
              <span dir="ltr">{overallPercentage}%</span>
            </div>
          </TableCell>
          <TableCell />
        </TableRow>
      </TableBody>
    </Table>
  );
};
