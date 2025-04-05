
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { useOpeningBalances } from "@/hooks/accounting/useOpeningBalances";
import { useOpeningBalanceOperations } from "@/hooks/accounting/useOpeningBalanceOperations";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/components/finance/reports/utils/formatters";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface OpeningBalancesTableProps {
  periodId: string;
}

export const OpeningBalancesTable = ({ periodId }: OpeningBalancesTableProps) => {
  const { openingBalances, isLoading } = useOpeningBalances(periodId);
  const { deleteOpeningBalance } = useOpeningBalanceOperations();
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteOpeningBalance(id, periodId);
      
      if (result.success) {
        toast({
          title: "تم حذف الرصيد الافتتاحي",
          description: "تم حذف الرصيد الافتتاحي بنجاح",
        });
      } else {
        toast({
          title: "خطأ في العملية",
          description: "فشل حذف الرصيد الافتتاحي",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ في العملية",
        description: "حدث خطأ أثناء حذف الرصيد الافتتاحي",
        variant: "destructive",
      });
    }
  };

  // Group by account type for better visual organization
  const groupedBalances = openingBalances.reduce((acc, balance) => {
    const type = balance.account?.account_type || "other";
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(balance);
    return acc;
  }, {} as Record<string, typeof openingBalances>);

  // Account type labels in Arabic
  const accountTypeLabels: Record<string, string> = {
    asset: "الأصول",
    liability: "الالتزامات",
    equity: "حقوق الملكية",
    revenue: "الإيرادات",
    expense: "المصروفات",
    other: "أخرى"
  };

  // Sort account types in logical order
  const sortedAccountTypes = ["asset", "liability", "equity", "revenue", "expense", "other"];
  
  // Calculate totals
  const totalDebits = openingBalances.reduce((sum, balance) => sum + balance.debit_amount, 0);
  const totalCredits = openingBalances.reduce((sum, balance) => sum + balance.credit_amount, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <p>جاري تحميل البيانات...</p>
      </div>
    );
  }

  if (!openingBalances || openingBalances.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40">
        <p className="text-muted-foreground mb-4">لا توجد أرصدة افتتاحية مسجلة بعد</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table dir="rtl">
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">رمز الحساب</TableHead>
            <TableHead className="text-right">اسم الحساب</TableHead>
            <TableHead className="text-right">مدين</TableHead>
            <TableHead className="text-right">دائن</TableHead>
            <TableHead className="text-right">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedAccountTypes.filter(type => groupedBalances[type]).map(type => (
            <React.Fragment key={type}>
              <TableRow className="bg-muted/50">
                <TableCell colSpan={5} className="font-bold">
                  {accountTypeLabels[type]}
                </TableCell>
              </TableRow>
              {groupedBalances[type].map((balance) => (
                <TableRow key={balance.id}>
                  <TableCell>{balance.account?.code}</TableCell>
                  <TableCell>{balance.account?.name}</TableCell>
                  <TableCell>{formatCurrency(balance.debit_amount)}</TableCell>
                  <TableCell>{formatCurrency(balance.credit_amount)}</TableCell>
                  <TableCell>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-red-500">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                          <AlertDialogDescription>
                            سيؤدي هذا الإجراء إلى حذف الرصيد الافتتاحي لهذا الحساب. هذا الإجراء لا يمكن التراجع عنه.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(balance.id)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            حذف
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </React.Fragment>
          ))}
          <TableRow className="font-bold">
            <TableCell colSpan={2}>الإجماليات</TableCell>
            <TableCell>{formatCurrency(totalDebits)}</TableCell>
            <TableCell>{formatCurrency(totalCredits)}</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};
