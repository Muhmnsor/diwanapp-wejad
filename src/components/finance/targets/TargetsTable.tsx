
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
}

export const TargetsTable: React.FC<TargetsTableProps> = ({
  targets,
  loading,
  onEdit,
  onDelete,
}) => {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(num);
  };

  const calculatePercentage = (actual: number, target: number) => {
    if (target === 0) return 0;
    return Math.round((actual / target) * 100);
  };

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
          <TableHead>السنة</TableHead>
          <TableHead>الفترة</TableHead>
          <TableHead>المستهدف</TableHead>
          <TableHead>المتحقق</TableHead>
          <TableHead>نسبة التحقق</TableHead>
          <TableHead>إجراءات</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {targets.map((target) => (
          <TableRow key={target.id}>
            <TableCell>{target.year}</TableCell>
            <TableCell>
              {target.period_type === "yearly" 
                ? "سنوي" 
                : `الربع ${target.quarter}`}
            </TableCell>
            <TableCell>{formatNumber(target.target_amount)}</TableCell>
            <TableCell>{formatNumber(target.actual_amount)}</TableCell>
            <TableCell>
              <div className="flex items-center">
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
                <span>{calculatePercentage(target.actual_amount, target.target_amount)}%</span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex space-x-2 space-x-reverse">
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
      </TableBody>
    </Table>
  );
};
