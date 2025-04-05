
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAccounts } from "@/hooks/accounting/useAccounts";
import { supabase } from "@/integrations/supabase/client";
import { CalendarIcon, Plus, Trash } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface JournalItem {
  id?: string;
  account_id: string;
  description?: string;
  debit_amount: number;
  credit_amount: number;
}

interface JournalEntryFormProps {
  entry?: any;
  onCancel: () => void;
  onSuccess: () => void;
}

export const JournalEntryForm: React.FC<JournalEntryFormProps> = ({
  entry,
  onCancel,
  onSuccess,
}) => {
  const { toast } = useToast();
  const { accounts } = useAccounts();
  
  const initialItems: JournalItem[] = entry?.items
    ? entry.items.map((item: any) => ({
        id: item.id,
        account_id: item.account_id,
        description: item.description || "",
        debit_amount: item.debit_amount || 0,
        credit_amount: item.credit_amount || 0,
      }))
    : [
        {
          account_id: "",
          debit_amount: 0,
          credit_amount: 0,
        },
      ];

  const [formData, setFormData] = useState({
    date: entry?.date ? new Date(entry.date) : new Date(),
    reference_number: entry?.reference_number || "",
    description: entry?.description || "",
    status: entry?.status || "draft",
  });

  const [items, setItems] = useState<JournalItem[]>(initialItems);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        account_id: "",
        debit_amount: 0,
        credit_amount: 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleItemChange = (
    index: number,
    field: keyof JournalItem,
    value: any
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  // Calculate totals
  const totalDebit = items.reduce(
    (sum, item) => sum + Number(item.debit_amount || 0),
    0
  );
  
  const totalCredit = items.reduce(
    (sum, item) => sum + Number(item.credit_amount || 0),
    0
  );

  const isBalanced = totalDebit === totalCredit && totalDebit > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description || !formData.date) {
      toast({
        title: "خطأ في النموذج",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    if (!isBalanced) {
      toast({
        title: "خطأ في القيد المحاسبي",
        description: "يجب أن تكون المدينة والدائنة متساوية",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const formattedDate = formData.date instanceof Date 
        ? formData.date.toISOString().split('T')[0]
        : formData.date;

      let entryId = entry?.id;
      
      if (entry?.id) {
        // Update existing entry
        const { error } = await supabase
          .from("accounting_journal_entries")
          .update({
            date: formattedDate,
            reference_number: formData.reference_number,
            description: formData.description,
            status: formData.status,
            total_amount: totalDebit, // Same as totalCredit since they're balanced
            updated_at: new Date().toISOString(),
          })
          .eq("id", entry.id);

        if (error) throw error;

        // Delete existing items to replace with new ones
        const { error: deleteError } = await supabase
          .from("accounting_journal_items")
          .delete()
          .eq("journal_entry_id", entry.id);

        if (deleteError) throw deleteError;
      } else {
        // Create new entry
        const { data, error } = await supabase
          .from("accounting_journal_entries")
          .insert({
            date: formattedDate,
            reference_number: formData.reference_number,
            description: formData.description,
            status: formData.status,
            total_amount: totalDebit, // Same as totalCredit since they're balanced
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select();

        if (error) throw error;
        entryId = data[0].id;
      }

      // Insert all items
      const { error: itemsError } = await supabase
        .from("accounting_journal_items")
        .insert(
          items.map(item => ({
            journal_entry_id: entryId,
            account_id: item.account_id,
            description: item.description,
            debit_amount: Number(item.debit_amount) || 0,
            credit_amount: Number(item.credit_amount) || 0,
          }))
        );

      if (itemsError) throw itemsError;

      toast({
        title: entry ? "تم تحديث القيد" : "تم إنشاء القيد",
        description: entry ? "تم تحديث القيد المحاسبي بنجاح" : "تم إضافة القيد المحاسبي بنجاح",
      });
      
      onSuccess();
    } catch (error) {
      console.error("Error saving journal entry:", error);
      toast({
        title: "خطأ في العملية",
        description: "حدث خطأ أثناء حفظ البيانات",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rtl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">التاريخ</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-right font-normal",
                  !formData.date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="ml-2 h-4 w-4" />
                {formData.date ? (
                  format(formData.date, "PPP", { locale: ar })
                ) : (
                  <span>اختر التاريخ</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.date instanceof Date ? formData.date : new Date(formData.date)}
                onSelect={(date) => setFormData(prev => ({ ...prev, date: date || new Date() }))}
                initialFocus
              />
            </PopoverContent>
          </Popover>
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
          <Label>الحالة</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleSelectChange("status", value)}
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
        <Label htmlFor="description">البيان</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="وصف القيد المحاسبي"
          value={formData.description}
          onChange={handleChange}
        />
      </div>

      {/* Journal Items */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">تفاصيل القيد</h3>
          <Button type="button" size="sm" variant="outline" onClick={handleAddItem}>
            <Plus className="ml-1 h-4 w-4" /> إضافة سطر
          </Button>
        </div>

        <div className="rounded-md border">
          <table className="w-full">
            <thead>
              <tr className="bg-muted">
                <th className="text-right p-2 border-b">الحساب</th>
                <th className="text-right p-2 border-b">البيان</th>
                <th className="text-right p-2 border-b">مدين</th>
                <th className="text-right p-2 border-b">دائن</th>
                <th className="text-right p-2 border-b w-10"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="p-2">
                    <Select
                      value={item.account_id}
                      onValueChange={(value) =>
                        handleItemChange(index, "account_id", value)
                      }
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
                      placeholder="بيان السطر (اختياري)"
                      value={item.description || ""}
                      onChange={(e) =>
                        handleItemChange(index, "description", e.target.value)
                      }
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={item.debit_amount || ""}
                      onChange={(e) =>
                        handleItemChange(index, "debit_amount", e.target.value)
                      }
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={item.credit_amount || ""}
                      onChange={(e) =>
                        handleItemChange(index, "credit_amount", e.target.value)
                      }
                    />
                  </td>
                  <td className="p-2">
                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(index)}
                      >
                        <Trash className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {/* Totals Row */}
              <tr className="bg-muted">
                <td colSpan={2} className="p-2 text-left font-medium">
                  الإجمالي
                </td>
                <td className="p-2 font-bold">
                  {totalDebit.toFixed(2)} ريال
                </td>
                <td className="p-2 font-bold">
                  {totalCredit.toFixed(2)} ريال
                </td>
                <td></td>
              </tr>
              {/* Balance Status */}
              {!isBalanced && totalDebit > 0 && totalCredit > 0 && (
                <tr className="bg-red-50">
                  <td colSpan={5} className="p-2 text-center text-red-600">
                    القيد غير متوازن: الفرق = {Math.abs(totalDebit - totalCredit).toFixed(2)} ريال
                  </td>
                </tr>
              )}
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
            : "إضافة القيد"}
        </Button>
      </div>
    </form>
  );
};
