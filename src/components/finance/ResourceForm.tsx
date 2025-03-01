
import { useState } from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

// البنود الافتراضية ونسبها المئوية
const defaultBudgetItems = [
  { id: 1, name: "الرواتب", percentage: 15.5 },
  { id: 2, name: "التشغيل", percentage: 11.3 },
  { id: 3, name: "العقود", percentage: 25.9 },
  { id: 4, name: "التسويق", percentage: 8.4 },
  { id: 5, name: "تنفيذ البرامج", percentage: 39 },
];

interface ResourceFormProps {
  onCancel: () => void;
  onSubmit: () => void;
}

export const ResourceForm = ({ onCancel, onSubmit }: ResourceFormProps) => {
  const [useDefaultPercentages, setUseDefaultPercentages] = useState(true);
  const [totalAmount, setTotalAmount] = useState<number | "">("");
  const [obligationsAmount, setObligationsAmount] = useState<number | "">(0);
  const [budgetItems, setBudgetItems] = useState(
    defaultBudgetItems.map((item) => ({
      ...item,
      value: 0, // القيمة المحسوبة بالريال
    }))
  );

  // حساب القيم بناءً على النسب والمبلغ الإجمالي
  const calculateValues = (
    total: number,
    obligations: number,
    useDefaults: boolean
  ) => {
    const netAmount = total - obligations;
    
    // حساب قيمة كل بند بناءً على النسبة
    return defaultBudgetItems.map((item) => ({
      ...item,
      percentage: useDefaults ? item.percentage : 0,
      value: useDefaults
        ? parseFloat(((netAmount * item.percentage) / 100).toFixed(2))
        : 0,
    }));
  };

  // التعامل مع تغيير إجمالي المبلغ
  const handleTotalAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === "" ? "" : parseFloat(e.target.value);
    setTotalAmount(value);
    
    if (typeof value === "number" && !isNaN(value)) {
      const obligations = typeof obligationsAmount === "number" ? obligationsAmount : 0;
      setBudgetItems(calculateValues(value, obligations, useDefaultPercentages));
    }
  };

  // التعامل مع تغيير مبلغ الالتزامات
  const handleObligationsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === "" ? 0 : parseFloat(e.target.value);
    setObligationsAmount(value);
    
    if (typeof totalAmount === "number") {
      setBudgetItems(calculateValues(totalAmount, value, useDefaultPercentages));
    }
  };

  // التعامل مع تغيير النسب (استخدام الافتراضية أم لا)
  const handleUseDefaultsChange = (value: string) => {
    const useDefaults = value === "default";
    setUseDefaultPercentages(useDefaults);
    
    if (typeof totalAmount === "number") {
      const obligations = typeof obligationsAmount === "number" ? obligationsAmount : 0;
      setBudgetItems(calculateValues(totalAmount, obligations, useDefaults));
    }
  };

  // تغيير نسبة بند معين (في حالة الإدخال اليدوي)
  const handleItemPercentageChange = (
    id: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newPercentage = parseFloat(e.target.value);
    if (isNaN(newPercentage)) return;

    const newItems = budgetItems.map((item) =>
      item.id === id ? { ...item, percentage: newPercentage } : item
    );
    
    setBudgetItems(newItems);
    
    // حساب القيم بالريال بناءً على النسب الجديدة
    if (typeof totalAmount === "number") {
      const obligations = typeof obligationsAmount === "number" ? obligationsAmount : 0;
      const netAmount = totalAmount - obligations;
      
      setBudgetItems(
        newItems.map((item) => ({
          ...item,
          value: parseFloat(((netAmount * item.percentage) / 100).toFixed(2)),
        }))
      );
    }
  };

  // حساب إجمالي النسب المئوية المدخلة
  const totalPercentage = budgetItems.reduce(
    (sum, item) => sum + item.percentage,
    0
  );

  // التحقق من صحة النسب (المجموع يجب أن يكون 100%)
  const isValidPercentages = Math.round(totalPercentage) === 100;

  // عند تقديم النموذج
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // التحقق من إدخال البيانات الأساسية
    if (typeof totalAmount !== "number" || totalAmount <= 0) {
      toast.error("الرجاء إدخال مبلغ إجمالي صحيح");
      return;
    }
    
    // التحقق من صحة النسب المئوية إذا كان الإدخال يدويًا
    if (!useDefaultPercentages && !isValidPercentages) {
      toast.error("مجموع النسب المئوية يجب أن يكون 100%");
      return;
    }
    
    // بناء كائن البيانات للإرسال
    const resourceData = {
      date: new Date().toISOString().split("T")[0],
      source: (document.getElementById("source") as HTMLInputElement).value,
      type: (document.getElementById("type") as HTMLSelectElement).value,
      entity: (document.getElementById("entity") as HTMLInputElement).value,
      totalAmount,
      obligationsAmount: typeof obligationsAmount === "number" ? obligationsAmount : 0,
      netAmount: totalAmount - (typeof obligationsAmount === "number" ? obligationsAmount : 0),
      budgetItems: budgetItems.map(({ id, name, percentage, value }) => ({
        id,
        name,
        percentage,
        value,
      })),
    };
    
    console.log("بيانات المورد المضاف:", resourceData);
    toast.success("تم إضافة المورد بنجاح");
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="source">مصدر المورد</Label>
          <Input id="source" placeholder="مثال: منحة، تبرع، إيرادات" required />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="type">نوع المورد</Label>
          <Select defaultValue="unbound" id="type">
            <SelectTrigger>
              <SelectValue placeholder="اختر نوع المورد" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bound">مقيد</SelectItem>
              <SelectItem value="unbound">غير مقيد</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="entity">الجهة</Label>
          <Input id="entity" placeholder="الجهة التي جاء منها المورد" required />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="totalAmount">المبلغ الإجمالي (ريال)</Label>
          <Input
            id="totalAmount"
            type="number"
            min="0"
            step="0.01"
            value={totalAmount}
            onChange={handleTotalAmountChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="obligationsAmount">الالتزامات (ريال)</Label>
          <Input
            id="obligationsAmount"
            type="number"
            min="0"
            step="0.01"
            value={obligationsAmount}
            onChange={handleObligationsChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label>صافي المبلغ (ريال)</Label>
          <Input
            value={
              typeof totalAmount === "number" && typeof obligationsAmount === "number"
                ? (totalAmount - obligationsAmount).toLocaleString()
                : ""
            }
            readOnly
            disabled
          />
        </div>
      </div>

      <Separator />

      <div>
        <Label>توزيع المبلغ على البنود</Label>
        <div className="mt-2">
          <RadioGroup defaultValue="default" onValueChange={handleUseDefaultsChange}>
            <div className="flex items-center space-x-2 space-x-reverse">
              <RadioGroupItem value="default" id="default" />
              <Label htmlFor="default">استخدام النسب الافتراضية</Label>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <RadioGroupItem value="manual" id="manual" />
              <Label htmlFor="manual">إدخال النسب يدويًا</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <div className="border rounded-lg p-4">
        <div className="grid grid-cols-3 gap-4 mb-4 font-bold">
          <div>البند</div>
          <div>النسبة المئوية</div>
          <div>القيمة (ريال)</div>
        </div>

        {budgetItems.map((item) => (
          <div key={item.id} className="grid grid-cols-3 gap-4 mb-2">
            <div className="flex items-center">{item.name}</div>
            <div>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={item.percentage}
                onChange={(e) => handleItemPercentageChange(item.id, e)}
                disabled={useDefaultPercentages}
              />
            </div>
            <div>
              <Input
                value={item.value.toLocaleString()}
                readOnly
                disabled
              />
            </div>
          </div>
        ))}

        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t font-bold">
          <div>الإجمالي</div>
          <div
            className={
              !useDefaultPercentages && !isValidPercentages
                ? "text-red-500"
                : ""
            }
          >
            {totalPercentage.toFixed(1)}%
          </div>
          <div>
            {typeof totalAmount === "number" && typeof obligationsAmount === "number"
              ? (totalAmount - obligationsAmount).toLocaleString()
              : "0"}
            {" ريال"}
          </div>
        </div>

        {!useDefaultPercentages && !isValidPercentages && (
          <p className="text-red-500 mt-2 text-sm">
            مجموع النسب المئوية يجب أن يكون 100% (القيمة الحالية: {totalPercentage.toFixed(1)}%)
          </p>
        )}
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          إلغاء
        </Button>
        <Button type="submit">إضافة المورد</Button>
      </div>
    </form>
  );
};
