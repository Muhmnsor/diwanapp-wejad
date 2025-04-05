
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAccounts } from "@/hooks/accounting/useAccounts";
import { useCostCenters } from "@/hooks/accounting/useCostCenters";
import { nanoid } from "nanoid";
import { formatCurrency } from "@/components/finance/reports/utils/formatters";

interface JournalEntryFormProps {
  entry?: any;
  onCancel: () => void;
  onSuccess: () => void;
}

export const JournalEntryForm = ({ entry, onCancel, onSuccess }: JournalEntryFormProps) => {
  const { toast } = useToast();
  const { accounts } = useAccounts();
  const { costCenters = [], isLoading: isLoadingCostCenters, error: costCentersError } = useCostCenters();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    date: entry?.date || new Date().toISOString().split('T')[0],
    reference_number: entry?.reference_number || "",
    description: entry?.description || "",
    status: entry?.status || "draft",
    items: entry?.items?.length
      ? entry.items.map((item: any) => ({
          id: item.id,
          account_id: item.account_id,
          description: item.description || "",
          debit_amount: Number(item.debit_amount) || 0,
          credit_amount: Number(item.credit_amount) || 0,
          cost_center_id: item.cost_center_id || "",
          _tempId: nanoid(), // For UI handling
        }))
      : [
          {
            account_id: "",
            description: "",
            debit_amount: 0,
            credit_amount: 0,
            cost_center_id: "",
            _tempId: nanoid(),
          },
        ],
  });

  // Calculate totals
  const totalDebit = formData.items.reduce((sum, item) => sum + Number(item.debit_amount), 0);
  const totalCredit = formData.items.reduce((sum, item) => sum + Number(item.credit_amount), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.001; // Allow for small rounding errors

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updatedItems = [...formData.items];
    
    // For account_id, we might need special handling
    if (field === 'account_id') {
      updatedItems[index][field] = value;
    } 
    // For amounts, ensure they are numbers
    else if (field === 'debit_amount' || field === 'credit_amount') {
      updatedItems[index][field] = parseFloat(value) || 0;
      
      // If setting a debit amount and it's > 0, clear credit for this row
      if (field === 'debit_amount' && parseFloat(value) > 0) {
        updatedItems[index].credit_amount = 0;
      }
      // If setting a credit amount and it's > 0, clear debit for this row
      else if (field === 'credit_amount' && parseFloat(value) > 0) {
        updatedItems[index].debit_amount = 0;
      }
    } 
    // For other fields
    else {
      updatedItems[index][field] = value;
    }
    
    setFormData((prev) => ({ ...prev, items: updatedItems }));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          account_id: "",
          description: "",
          debit_amount: 0,
          credit_amount: 0,
          cost_center_id: "",
          _tempId: nanoid(),
        },
      ],
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length <= 1) {
      return; // Don't remove the last item
    }
    const updatedItems = [...formData.items];
    updatedItems.splice(index, 1);
    setFormData((prev) => ({ ...prev, items: updatedItems }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isBalanced) {
      toast({
        title: "القيد غير متوازن",
        description: "يجب أن يكون إجمالي المدين يساوي إجمالي الدائن",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.date || !formData.description || formData.items.some(item => !item.account_id)) {
      toast({
        title: "بيانات غير مكتملة",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Clean up items for submission (remove _tempId)
      const cleanedItems = formData.items.map(({ _tempId, ...item }) => ({
        ...item,
        debit_amount: Number(item.debit_amount),
        credit_amount: Number(item.credit_amount),
      }));
      
      const submissionData = {
        ...formData,
        items: cleanedItems,
      };
      
      // Here we would normally have API calls to create or update
      // For now, just simulate success
      setTimeout(() => {
        toast({
          title: entry ? "تم تحديث القيد" : "تم إنشاء القيد",
          description: entry ? "تم تحديث القيد المحاسبي بنجاح" : "تم إنشاء القيد المحاسبي بنجاح",
        });
        onSuccess();
        setIsSubmitting(false);
      }, 1000);
    } catch (error) {
      console.error("Error saving journal entry:", error);
      toast({
        title: "خطأ في العملية",
        description: "حدث خطأ أثناء حفظ القيد المحاسبي",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rtl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">التاريخ</Label>
          <Input
            id="date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reference_number">رقم المرجع</Label>
          <Input
            id="reference_number"
            name="reference_number"
            placeholder="رقم المرجع (اختياري)"
            value={formData.reference_number}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">الحالة</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">مسودة</SelectItem>
              <SelectItem value="posted">مرحل</SelectItem>
              <SelectItem value="cancelled">ملغى</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">الوصف</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="وصف القيد المحاسبي"
          value={formData.description}
          onChange={handleChange}
          rows={2}
        />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">بنود القيد</h3>
          <Button type="button" variant="outline" onClick={addItem}>
            إضافة بند
          </Button>
        </div>

        <div className="border rounded-md overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                <th className="p-2 text-right">الحساب</th>
                <th className="p-2 text-right">الوصف</th>
                <th className="p-2 text-right">مركز التكلفة</th>
                <th className="p-2 text-right">مدين</th>
                <th className="p-2 text-right">دائن</th>
                <th className="p-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {formData.items.map((item, index) => (
                <tr key={item._tempId} className="border-t">
                  <td className="p-2">
                    <Select
                      value={item.account_id}
                      onValueChange={(value) => handleItemChange(index, "account_id", value)}
                    >
                      <SelectTrigger>
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
                  </td>
                  <td className="p-2">
                    <Input
                      placeholder="وصف البند (اختياري)"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, "description", e.target.value)}
                    />
                  </td>
                  <td className="p-2">
                    <Select
                      value={item.cost_center_id}
                      onValueChange={(value) => handleItemChange(index, "cost_center_id", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر مركز التكلفة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">بدون مركز تكلفة</SelectItem>
                        {costCenters?.map((costCenter) => (
                          <SelectItem key={costCenter.id} value={costCenter.id}>
                            {costCenter.code} - {costCenter.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="">لا توجد مراكز تكلفة</SelectItem>
                       )}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-2">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.debit_amount}
                      onChange={(e) => handleItemChange(index, "debit_amount", e.target.value)}
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.credit_amount}
                      onChange={(e) => handleItemChange(index, "credit_amount", e.target.value)}
                    />
                  </td>
                  <td className="p-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                      disabled={formData.items.length <= 1}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-red-500"
                      >
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                      </svg>
                    </Button>
                  </td>
                </tr>
              ))}
              <tr className="border-t bg-muted/50 font-medium">
                <td colSpan={3} className="p-2 text-left">
                  الإجمالي
                </td>
                <td className="p-2">{formatCurrency(totalDebit)}</td>
                <td className="p-2">{formatCurrency(totalCredit)}</td>
                <td className="p-2"></td>
              </tr>
              <tr>
                <td colSpan={6} className="p-2">
                  <div className={`text-sm ${isBalanced ? 'text-green-500' : 'text-red-500'}`}>
                    {isBalanced ? 'القيد متوازن' : 'القيد غير متوازن'}
                    {!isBalanced && ` (الفرق: ${formatCurrency(Math.abs(totalDebit - totalCredit))})`}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          إلغاء
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting || !isBalanced}
        >
          {isSubmitting
            ? "جاري الحفظ..."
            : entry
            ? "تحديث القيد"
            : "إنشاء القيد"}
        </Button>
      </div>
    </form>
  );
};
