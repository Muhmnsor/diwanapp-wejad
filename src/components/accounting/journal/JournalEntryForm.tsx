
import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Trash } from "lucide-react";

interface JournalEntryFormProps {
  entry?: any;
  onCancel: () => void;
  onSuccess: () => void;
}

export const JournalEntryForm = ({
  entry,
  onCancel,
  onSuccess,
}: JournalEntryFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { accounts, isLoading } = useAccounts();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!entry;

  const { register, handleSubmit, control, formState: { errors }, reset, watch, setValue } = useForm({
    defaultValues: isEditing
      ? {
          date: entry.date,
          reference_number: entry.reference_number || "",
          description: entry.description,
          items: entry.items || [],
        }
      : {
          date: new Date().toISOString().split("T")[0],
          reference_number: "",
          description: "",
          items: [{ account_id: "", description: "", debit_amount: 0, credit_amount: 0 }],
        },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  // مراقبة قيم الحقول لحساب المجاميع
  const items = watch("items");
  const [totalDebit, setTotalDebit] = useState(0);
  const [totalCredit, setTotalCredit] = useState(0);
  const [isBalanced, setIsBalanced] = useState(false);

  useEffect(() => {
    if (items) {
      const debitTotal = items.reduce((sum, item) => sum + (parseFloat(item.debit_amount) || 0), 0);
      const creditTotal = items.reduce((sum, item) => sum + (parseFloat(item.credit_amount) || 0), 0);
      
      setTotalDebit(debitTotal);
      setTotalCredit(creditTotal);
      setIsBalanced(Math.abs(debitTotal - creditTotal) < 0.01);
    }
  }, [items]);

  const onSubmit = async (data: any) => {
    if (!isBalanced) {
      toast({
        title: "القيد غير متوازن",
        description: "يجب أن يتساوى مجموع المدين مع مجموع الدائن",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing) {
        // تحديث القيد الموجود
        const { error: entryError } = await supabase
          .from("accounting_journal_entries")
          .update({
            date: data.date,
            reference_number: data.reference_number,
            description: data.description,
            total_amount: totalDebit,
            updated_at: new Date(),
          })
          .eq("id", entry.id);

        if (entryError) throw entryError;

        // حذف البنود القديمة
        const { error: deleteError } = await supabase
          .from("accounting_journal_items")
          .delete()
          .eq("journal_entry_id", entry.id);

        if (deleteError) throw deleteError;

        // إضافة البنود الجديدة
        const { error: itemsError } = await supabase
          .from("accounting_journal_items")
          .insert(
            data.items.map((item: any) => ({
              journal_entry_id: entry.id,
              account_id: item.account_id,
              description: item.description,
              debit_amount: parseFloat(item.debit_amount) || 0,
              credit_amount: parseFloat(item.credit_amount) || 0,
            }))
          );

        if (itemsError) throw itemsError;

        toast({
          title: "تم تحديث القيد المحاسبي بنجاح",
        });
      } else {
        // إنشاء قيد جديد
        const { data: newEntry, error: entryError } = await supabase
          .from("accounting_journal_entries")
          .insert({
            date: data.date,
            reference_number: data.reference_number,
            description: data.description,
            status: "draft",
            total_amount: totalDebit,
            created_by: (await supabase.auth.getUser()).data.user?.id,
          })
          .select()
          .single();

        if (entryError) throw entryError;

        // إضافة البنود
        const { error: itemsError } = await supabase
          .from("accounting_journal_items")
          .insert(
            data.items.map((item: any) => ({
              journal_entry_id: newEntry.id,
              account_id: item.account_id,
              description: item.description,
              debit_amount: parseFloat(item.debit_amount) || 0,
              credit_amount: parseFloat(item.credit_amount) || 0,
            }))
          );

        if (itemsError) throw itemsError;

        toast({
          title: "تم إنشاء القيد المحاسبي بنجاح",
        });
      }

      // تحديث البيانات
      queryClient.invalidateQueries({ queryKey: ["accounting_journal_entries"] });
      reset();
      onSuccess();
    } catch (error: any) {
      toast({
        title: "حدث خطأ",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddItem = () => {
    append({ account_id: "", description: "", debit_amount: 0, credit_amount: 0 });
  };

  if (isLoading) {
    return <div>جاري تحميل البيانات...</div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col space-y-2">
          <Label htmlFor="date">التاريخ</Label>
          <Input
            id="date"
            type="date"
            {...register("date", {
              required: "التاريخ مطلوب",
            })}
          />
          {errors.date && (
            <p className="text-sm text-red-500">{errors.date.message as string}</p>
          )}
        </div>

        <div className="flex flex-col space-y-2">
          <Label htmlFor="reference_number">الرقم المرجعي</Label>
          <Input
            id="reference_number"
            {...register("reference_number")}
          />
        </div>

        <div className="flex flex-col space-y-2 md:col-span-1">
          <Label htmlFor="description">الوصف</Label>
          <Input
            id="description"
            {...register("description", {
              required: "الوصف مطلوب",
            })}
          />
          {errors.description && (
            <p className="text-sm text-red-500">{errors.description.message as string}</p>
          )}
        </div>
      </div>

      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-medium mb-4">بنود القيد</h3>
        
        <div className="grid grid-cols-12 gap-4 mb-2 bg-gray-50 p-2 rounded">
          <div className="col-span-4 font-medium">الحساب</div>
          <div className="col-span-3 font-medium">الوصف</div>
          <div className="col-span-2 font-medium">مدين</div>
          <div className="col-span-2 font-medium">دائن</div>
          <div className="col-span-1"></div>
        </div>

        {fields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-12 gap-4 mb-4 items-center">
            <div className="col-span-4">
              <Select
                defaultValue={field.account_id}
                onValueChange={(value) => {
                  setValue(`items.${index}.account_id`, value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الحساب" />
                </SelectTrigger>
                <SelectContent>
                  {accounts?.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.code} - {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.items?.[index]?.account_id && (
                <p className="text-sm text-red-500">هذا الحقل مطلوب</p>
              )}
            </div>

            <div className="col-span-3">
              <Input
                {...register(`items.${index}.description`)}
                placeholder="وصف البند"
              />
            </div>

            <div className="col-span-2">
              <Input
                type="number"
                step="0.01"
                min="0"
                {...register(`items.${index}.debit_amount`, {
                  setValueAs: (v) => (v === "" ? 0 : parseFloat(v)),
                })}
                placeholder="0.00"
                onChange={(e) => {
                  setValue(`items.${index}.debit_amount`, parseFloat(e.target.value) || 0);
                  if (parseFloat(e.target.value) > 0) {
                    setValue(`items.${index}.credit_amount`, 0);
                  }
                }}
              />
            </div>

            <div className="col-span-2">
              <Input
                type="number"
                step="0.01"
                min="0"
                {...register(`items.${index}.credit_amount`, {
                  setValueAs: (v) => (v === "" ? 0 : parseFloat(v)),
                })}
                placeholder="0.00"
                onChange={(e) => {
                  setValue(`items.${index}.credit_amount`, parseFloat(e.target.value) || 0);
                  if (parseFloat(e.target.value) > 0) {
                    setValue(`items.${index}.debit_amount`, 0);
                  }
                }}
              />
            </div>

            <div className="col-span-1">
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddItem}
          className="mt-2"
        >
          <Plus className="h-4 w-4 mr-2" />
          إضافة بند
        </Button>

        <div className="grid grid-cols-12 gap-4 mt-4 pt-4 border-t">
          <div className="col-span-4 md:col-span-7"></div>
          <div className="col-span-4 md:col-span-2 font-medium">المجموع</div>
          <div className="col-span-2 font-medium">{totalDebit.toFixed(2)}</div>
          <div className="col-span-2 font-medium">{totalCredit.toFixed(2)}</div>
        </div>

        {!isBalanced && (
          <div className="bg-red-50 text-red-700 p-2 mt-2 rounded text-sm">
            القيد غير متوازن. الفرق: {Math.abs(totalDebit - totalCredit).toFixed(2)}
          </div>
        )}

        {isBalanced && totalDebit > 0 && (
          <div className="bg-green-50 text-green-700 p-2 mt-2 rounded text-sm">
            القيد متوازن
          </div>
        )}
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          إلغاء
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting || !isBalanced || totalDebit === 0}
        >
          {isSubmitting ? "جاري الحفظ..." : isEditing ? "تحديث القيد" : "إضافة القيد"}
        </Button>
      </div>
    </form>
  );
};
