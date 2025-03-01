
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ExpenseFormProps {
  onCancel: () => void;
  onSubmit: () => void;
}

interface BudgetItem {
  id: string;
  name: string;
}

export const ExpenseForm = ({ onCancel, onSubmit }: ExpenseFormProps) => {
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [amount, setAmount] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [beneficiary, setBeneficiary] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [isLoading, setIsLoading] = useState(false);

  // جلب بنود الميزانية من قاعدة البيانات
  useEffect(() => {
    const fetchBudgetItems = async () => {
      try {
        const { data, error } = await supabase
          .from('budget_items')
          .select('id, name');

        if (error) {
          throw error;
        }

        if (data) {
          setBudgetItems(data);
          // تحديد البند الأول كاختيار افتراضي إذا كان متوفراً
          if (data.length > 0) {
            setSelectedItemId(data[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching budget items:', error);
        toast.error('حدث خطأ أثناء جلب بنود الميزانية');
      }
    };

    fetchBudgetItems();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // التحقق من إدخال المعلومات الضرورية
    if (!selectedItemId || typeof amount !== "number" || amount <= 0 || !description) {
      toast.error("الرجاء ملء جميع الحقول المطلوبة");
      return;
    }

    setIsLoading(true);

    try {
      // إضافة المصروف إلى قاعدة البيانات
      const { error } = await supabase
        .from('expenses')
        .insert({
          date,
          budget_item_id: selectedItemId,
          amount,
          description,
          beneficiary: beneficiary || null
        });

      if (error) throw error;

      toast.success("تم إضافة المصروف بنجاح");
      onSubmit();
    } catch (error: any) {
      console.error("خطأ في حفظ المصروف:", error);
      toast.error(error.message || "حدث خطأ أثناء حفظ المصروف");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">التاريخ</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="budgetItem">البند</Label>
          <Select value={selectedItemId || ""} onValueChange={setSelectedItemId}>
            <SelectTrigger>
              <SelectValue placeholder="اختر البند" />
            </SelectTrigger>
            <SelectContent>
              {budgetItems.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">المبلغ (ريال)</Label>
          <Input
            id="amount"
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value === "" ? "" : parseFloat(e.target.value))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="beneficiary">المستفيد</Label>
          <Input
            id="beneficiary"
            placeholder="اسم الجهة أو الشخص المستفيد"
            value={beneficiary}
            onChange={(e) => setBeneficiary(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">وصف المصروف</Label>
        <Textarea
          id="description"
          placeholder="وصف تفصيلي للمصروف"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          إلغاء
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "جاري الحفظ..." : "إضافة المصروف"}
        </Button>
      </div>
    </form>
  );
};
