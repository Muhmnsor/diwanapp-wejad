
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { useObligationExpenses } from "./hooks/useObligationExpenses";

interface ObligationExpenseFormProps {
  obligationId: string;
  originalAmount: number;
  description: string;
  remainingBalance: number;
  onClose: () => void;
  onSuccess: () => void;
}

export const ObligationExpenseForm = ({
  obligationId,
  originalAmount,
  description,
  remainingBalance,
  onClose,
  onSuccess
}: ObligationExpenseFormProps) => {
  const [amount, setAmount] = useState<number>(0);
  const [expenseDescription, setExpenseDescription] = useState<string>("");
  const [beneficiary, setBeneficiary] = useState<string>("");
  const [reference, setReference] = useState<string>("");
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { addExpense } = useObligationExpenses(obligationId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate amount
    if (!amount || amount <= 0) {
      setError("الرجاء إدخال مبلغ صحيح");
      return;
    }
    
    // Validate amount doesn't exceed remaining balance
    if (amount > remainingBalance) {
      setError("المبلغ المدخل يتجاوز الرصيد المتبقي");
      return;
    }
    
    // Validate description
    if (!expenseDescription.trim()) {
      setError("الرجاء إدخال وصف للمصروف");
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      await addExpense({
        obligation_id: obligationId,
        amount,
        date,
        description: expenseDescription,
        beneficiary: beneficiary || undefined,
        reference_document: reference || undefined
      });
      
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError("حدث خطأ أثناء إضافة المصروف");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogContent className="max-w-md" dir="rtl">
      <DialogHeader>
        <DialogTitle>إضافة مصروف جديد</DialogTitle>
        <div className="text-sm text-muted-foreground mt-1">
          الالتزام: {description}
        </div>
        <div className="flex justify-between text-sm mt-2">
          <div>المبلغ الأصلي: <span className="font-medium">{originalAmount.toLocaleString()} ريال</span></div>
          <div>الرصيد المتبقي: <span className="font-medium">{remainingBalance.toLocaleString()} ريال</span></div>
        </div>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="amount">المبلغ (ريال)</Label>
          <Input
            id="amount"
            type="number"
            value={amount || ""}
            onChange={(e) => setAmount(parseFloat(e.target.value))}
            placeholder="أدخل المبلغ"
            required
            min={1}
            max={remainingBalance}
            step={0.01}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="date">تاريخ الصرف</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="expense-description">وصف المصروف</Label>
          <Textarea
            id="expense-description"
            value={expenseDescription}
            onChange={(e) => setExpenseDescription(e.target.value)}
            placeholder="أدخل وصف المصروف"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="beneficiary">المستفيد (اختياري)</Label>
          <Input
            id="beneficiary"
            value={beneficiary}
            onChange={(e) => setBeneficiary(e.target.value)}
            placeholder="أدخل اسم المستفيد"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="reference">مستند مرجعي (اختياري)</Label>
          <Input
            id="reference"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="رقم أو مرجع المستند"
          />
        </div>
        
        {error && (
          <div className="text-destructive text-sm">{error}</div>
        )}
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            إلغاء
          </Button>
          <Button type="submit" disabled={isSubmitting || amount <= 0}>
            {isSubmitting ? "جارِ الإضافة..." : "إضافة المصروف"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};
