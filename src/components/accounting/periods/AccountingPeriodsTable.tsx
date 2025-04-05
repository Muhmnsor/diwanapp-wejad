
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, ArrowUpDown, Lock, SquarePen } from "lucide-react";
import { AccountingPeriod } from "@/hooks/accounting/useAccountingPeriods";
import { format } from "date-fns";
import { useAccountingPeriodOperations } from "@/hooks/accounting/useAccountingPeriodOperations";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface AccountingPeriodsTableProps {
  periods: AccountingPeriod[];
  isLoading: boolean;
  onEdit: (period: AccountingPeriod) => void;
}

export const AccountingPeriodsTable = ({ periods, isLoading, onEdit }: AccountingPeriodsTableProps) => {
  const { closePeriod } = useAccountingPeriodOperations();
  const { toast } = useToast();
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  
  const handleClosePeriod = async (period: AccountingPeriod) => {
    if (period.is_closed) return;
    
    try {
      const result = await closePeriod(period.id);
      
      if (result.success) {
        toast({
          title: "تم إغلاق الفترة المحاسبية",
          description: `تم إغلاق الفترة "${period.name}" بنجاح`,
        });
      } else {
        toast({
          title: "خطأ في العملية",
          description: "فشل إغلاق الفترة المحاسبية",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ في العملية",
        description: "حدث خطأ أثناء إغلاق الفترة المحاسبية",
        variant: "destructive",
      });
    }
  };

  const toggleSort = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  };

  const sortedPeriods = [...periods].sort((a, b) => {
    const dateA = new Date(a.start_date).getTime();
    const dateB = new Date(b.start_date).getTime();
    return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <p>جاري تحميل البيانات...</p>
      </div>
    );
  }

  if (!periods || periods.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40">
        <p className="text-muted-foreground mb-4">لا توجد فترات محاسبية مسجلة بعد</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">اسم الفترة</TableHead>
            <TableHead className="text-right">
              <div className="flex items-center cursor-pointer" onClick={toggleSort}>
                <span>تاريخ البداية</span>
                <ArrowUpDown className="mr-2 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead className="text-right">تاريخ النهاية</TableHead>
            <TableHead className="text-right">الحالة</TableHead>
            <TableHead className="text-right">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedPeriods.map((period) => (
            <TableRow key={period.id}>
              <TableCell className="font-medium">{period.name}</TableCell>
              <TableCell>{format(new Date(period.start_date), "yyyy-MM-dd")}</TableCell>
              <TableCell>{format(new Date(period.end_date), "yyyy-MM-dd")}</TableCell>
              <TableCell>
                {period.is_closed ? (
                  <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700">
                    <Lock className="h-3 w-3 mr-1" />
                    مغلقة
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                    <SquarePen className="h-3 w-3 mr-1" />
                    مفتوحة
                  </span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onEdit(period)}
                    disabled={period.is_closed}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleClosePeriod(period)}
                    disabled={period.is_closed}
                  >
                    <Lock className="h-4 w-4" />
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
