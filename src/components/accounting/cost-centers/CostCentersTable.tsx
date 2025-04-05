
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Eye, EyeOff } from "lucide-react";
import { CostCenter } from "@/hooks/accounting/useCostCenters";

interface CostCentersTableProps {
  costCenters: CostCenter[];
  isLoading: boolean;
  onEdit: (costCenter: CostCenter) => void;
  onToggleStatus: (costCenter: CostCenter) => void;
}

export const CostCentersTable = ({ costCenters, isLoading, onEdit, onToggleStatus }: CostCentersTableProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <p>جاري تحميل البيانات...</p>
      </div>
    );
  }

  if (!costCenters || costCenters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40">
        <p className="text-muted-foreground mb-4">لا توجد مراكز تكلفة مسجلة بعد</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">الرمز</TableHead>
            <TableHead className="text-right">الاسم</TableHead>
            <TableHead className="text-right">الوصف</TableHead>
            <TableHead className="text-right">الحالة</TableHead>
            <TableHead className="text-right">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {costCenters.map((costCenter) => (
            <TableRow key={costCenter.id}>
              <TableCell className="font-medium">{costCenter.code}</TableCell>
              <TableCell>{costCenter.name}</TableCell>
              <TableCell>{costCenter.description || "—"}</TableCell>
              <TableCell>
                {costCenter.is_active ? (
                  <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                    نشط
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                    غير نشط
                  </span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => onEdit(costCenter)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onToggleStatus(costCenter)}>
                    {costCenter.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
