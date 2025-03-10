
import { useEffect, useState } from "react";
import { 
  Dialog,
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ObligationExpensesTable } from "./ObligationExpensesTable";
import { useObligationExpenses } from "./hooks/useObligationExpenses";
import { useObligationBalances } from "./hooks/useObligationBalances";
import { Progress } from "@/components/ui/progress";
import { PlusCircle } from "lucide-react";

interface ObligationDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  obligationId: string | null;
  obligationDescription: string;
  onAddExpense: () => void;
}

export const ObligationDetailsDialog = ({
  open,
  onOpenChange,
  obligationId,
  obligationDescription,
  onAddExpense
}: ObligationDetailsDialogProps) => {
  const [balance, setBalance] = useState<any>(null);
  
  const { expenses, loading, totalExpenses, refetch: refetchExpenses } = 
    useObligationExpenses(obligationId || undefined);
    
  const { balances, loading: loadingBalances, refetch: refetchBalances } = 
    useObligationBalances();
    
  // Find the balance for this obligation
  useEffect(() => {
    if (obligationId && balances) {
      const foundBalance = balances.find(b => b.obligation_id === obligationId);
      if (foundBalance) {
        setBalance(foundBalance);
      }
    }
  }, [obligationId, balances]);

  // Refetch data when dialog opens
  useEffect(() => {
    if (open && obligationId) {
      refetchExpenses();
      refetchBalances();
    }
  }, [open, obligationId]);

  if (!obligationId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>تفاصيل مصروفات الالتزام</DialogTitle>
          <div className="text-sm text-muted-foreground mt-1">
            {obligationDescription}
          </div>
        </DialogHeader>

        {balance && (
          <div className="bg-muted/50 p-4 rounded-md">
            <div className="grid grid-cols-3 gap-4 mb-3">
              <div>
                <div className="text-sm text-muted-foreground">المبلغ الأصلي</div>
                <div className="font-medium text-lg">{balance.original_amount.toLocaleString()} ريال</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">المبلغ المصروف</div>
                <div className="font-medium text-lg">{balance.spent_amount.toLocaleString()} ريال</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">الرصيد المتبقي</div>
                <div className="font-medium text-lg">{balance.remaining_balance.toLocaleString()} ريال</div>
              </div>
            </div>
            
            <div className="mt-2">
              <div className="flex justify-between text-sm mb-1">
                <span>نسبة الصرف</span>
                <span>{Math.round(balance.spending_percentage)}%</span>
              </div>
              <Progress 
                value={balance.spending_percentage} 
                className="h-3" 
                indicatorClassName={
                  balance.spending_percentage > 90 
                    ? "bg-destructive" 
                    : balance.spending_percentage > 70 
                      ? "bg-amber-500" 
                      : "bg-emerald-500"
                }
              />
            </div>
          </div>
        )}

        <div className="flex justify-between items-center my-4">
          <h3 className="text-lg font-medium">سجل المصروفات</h3>
          <Button onClick={onAddExpense} disabled={!balance || balance.remaining_balance <= 0}>
            <PlusCircle className="h-4 w-4 ml-1" />
            <span>إضافة مصروف</span>
          </Button>
        </div>

        <ObligationExpensesTable 
          expenses={expenses} 
          loading={loading} 
          totalSpent={balance?.spent_amount}
          originalAmount={balance?.original_amount}
        />
      </DialogContent>
    </Dialog>
  );
};
