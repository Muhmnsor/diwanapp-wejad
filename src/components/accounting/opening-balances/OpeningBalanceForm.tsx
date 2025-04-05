
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AccountingPeriod } from "@/hooks/accounting/useAccountingPeriods";
import { Account } from "@/hooks/accounting/useAccounts";
import { useOpeningBalances } from "@/hooks/accounting/useOpeningBalances";
import { useOpeningBalanceOperations } from "@/hooks/accounting/useOpeningBalanceOperations";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/components/finance/reports/utils/formatters";

interface OpeningBalanceFormProps {
  periods: AccountingPeriod[];
  accounts: Account[];
  selectedPeriodId?: string;
  onPeriodChange: (periodId: string) => void;
}

export const OpeningBalanceForm = ({ 
  periods, 
  accounts, 
  selectedPeriodId, 
  onPeriodChange 
}: OpeningBalanceFormProps) => {
  const { toast } = useToast();
  const { openingBalances, isLoading } = useOpeningBalances(selectedPeriodId);
  const { saveOpeningBalance, isLoading: isSaving } = useOpeningBalanceOperations();
  
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [accountType, setAccountType] = useState<string>("");
  const [debitAmount, setDebitAmount] = useState<string>("0");
  const [creditAmount, setCreditAmount] = useState<string>("0");
  
  const openPeriods = periods.filter(p => !p.is_closed);
  
  useEffect(() => {
    if (selectedAccount) {
      const account = accounts.find(a => a.id === selectedAccount);
      setAccountType(account?.account_type || "");
      
      // Check if there's already an opening balance for this account
      const existingBalance = openingBalances.find(ob => ob.account_id === selectedAccount);
      
      if (existingBalance) {
        setDebitAmount(existingBalance.debit_amount.toString());
        setCreditAmount(existingBalance.credit_amount.toString());
      } else {
        setDebitAmount("0");
        setCreditAmount("0");
      }
    }
  }, [selectedAccount, accounts, openingBalances]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPeriodId || !selectedAccount) {
      toast({
        title: "خطأ في النموذج",
        description: "يرجى اختيار الفترة والحساب",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const result = await saveOpeningBalance({
        account_id: selectedAccount,
        period_id: selectedPeriodId,
        debit_amount: parseFloat(debitAmount) || 0,
        credit_amount: parseFloat(creditAmount) || 0,
      });
      
      if (result.success) {
        toast({
          title: "تم حفظ الرصيد الافتتاحي",
          description: "تم حفظ الرصيد الافتتاحي بنجاح",
        });
        
        // Reset form
        setSelectedAccount("");
        setDebitAmount("0");
        setCreditAmount("0");
      } else {
        toast({
          title: "خطأ في العملية",
          description: "فشل حفظ الرصيد الافتتاحي",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ في العملية",
        description: "حدث خطأ أثناء حفظ الرصيد الافتتاحي",
        variant: "destructive",
      });
    }
  };
  
  // Calculate totals
  const totalDebits = openingBalances.reduce((sum, balance) => sum + balance.debit_amount, 0);
  const totalCredits = openingBalances.reduce((sum, balance) => sum + balance.credit_amount, 0);
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01; // Allow small rounding errors
  
  return (
    <div className="space-y-6 rtl">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>اختر الفترة المحاسبية</Label>
          <Select
            value={selectedPeriodId}
            onValueChange={onPeriodChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="اختر الفترة" />
            </SelectTrigger>
            <SelectContent>
              {openPeriods.map((period) => (
                <SelectItem key={period.id} value={period.id}>
                  {period.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {selectedPeriodId && (
          <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>اختر الحساب</Label>
                <Select
                  value={selectedAccount}
                  onValueChange={setSelectedAccount}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="اختر الحساب" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.code} - {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {accountType && (
                <div className="space-y-2">
                  <Label>نوع الحساب</Label>
                  <Input
                    value={accountType === "asset" ? "أصول" : 
                           accountType === "liability" ? "التزامات" : 
                           accountType === "equity" ? "حقوق ملكية" :
                           accountType === "revenue" ? "إيرادات" : "مصروفات"}
                    disabled
                  />
                </div>
              )}
            </div>
            
            {selectedAccount && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="debit">مدين</Label>
                  <Input
                    id="debit"
                    type="number"
                    value={debitAmount}
                    onChange={(e) => {
                      setDebitAmount(e.target.value);
                      if (parseFloat(e.target.value) > 0) {
                        setCreditAmount("0");
                      }
                    }}
                    step="0.01"
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="credit">دائن</Label>
                  <Input
                    id="credit"
                    type="number"
                    value={creditAmount}
                    onChange={(e) => {
                      setCreditAmount(e.target.value);
                      if (parseFloat(e.target.value) > 0) {
                        setDebitAmount("0");
                      }
                    }}
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
            )}
            
            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving || isLoading || !selectedAccount}>
                {isSaving ? "جاري الحفظ..." : "حفظ الرصيد"}
              </Button>
            </div>
          </form>
        )}
      </div>
      
      {selectedPeriodId && openingBalances && openingBalances.length > 0 && (
        <div className="border p-4 rounded-md">
          <div className="flex justify-between mb-2">
            <span className="font-bold">إجمالي المدين:</span>
            <span>{formatCurrency(totalDebits)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="font-bold">إجمالي الدائن:</span>
            <span>{formatCurrency(totalCredits)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold">الحالة:</span>
            <span className={isBalanced ? "text-green-500" : "text-red-500"}>
              {isBalanced ? "متوازن" : "غير متوازن"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
