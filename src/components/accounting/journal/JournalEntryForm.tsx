
import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { Trash2, Plus } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useAccounts } from "@/hooks/accounting/useAccounts";
import { useJournalEntries } from "@/hooks/accounting/useJournalEntries";
import { supabase } from "@/integrations/supabase/client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";

const journalItemSchema = z.object({
  id: z.string().optional(),
  account_id: z.string({ required_error: "الحساب مطلوب" }),
  description: z.string().optional(),
  debit_amount: z.coerce.number().min(0, { message: "يجب أن تكون القيمة 0 أو أكبر" }),
  credit_amount: z.coerce.number().min(0, { message: "يجب أن تكون القيمة 0 أو أكبر" }),
});

const journalEntrySchema = z.object({
  date: z.string({ required_error: "التاريخ مطلوب" }),
  reference_number: z.string().optional(),
  description: z.string({ required_error: "الوصف مطلوب" }).min(3, {
    message: "يجب أن يحتوي الوصف على 3 أحرف على الأقل",
  }),
  status: z.enum(["draft", "posted", "cancelled"], {
    required_error: "الحالة مطلوبة",
  }),
  items: z.array(journalItemSchema).nonempty({
    message: "يجب إضافة عنصر واحد على الأقل",
  }).refine(
    items => {
      const totalDebit = items.reduce((sum, item) => sum + (item.debit_amount || 0), 0);
      const totalCredit = items.reduce((sum, item) => sum + (item.credit_amount || 0), 0);
      return Math.abs(totalDebit - totalCredit) < 0.001; // Allow for floating point errors
    },
    {
      message: "يجب أن يتساوى مجموع المدين مع مجموع الدائن",
      path: ["items"],
    }
  ),
});

type JournalEntryFormValues = z.infer<typeof journalEntrySchema>;

interface JournalEntryFormProps {
  entry?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export const JournalEntryForm = ({ entry, onSuccess, onCancel }: JournalEntryFormProps) => {
  const { accounts, isLoading: isLoadingAccounts } = useAccounts();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<JournalEntryFormValues>({
    resolver: zodResolver(journalEntrySchema),
    defaultValues: {
      date: entry?.date || format(new Date(), "yyyy-MM-dd"),
      reference_number: entry?.reference_number || "",
      description: entry?.description || "",
      status: entry?.status || "draft",
      items: entry?.items?.length
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
              description: "",
              debit_amount: 0,
              credit_amount: 0,
            },
          ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const calculateTotals = () => {
    const items = form.getValues("items");
    const totalDebit = items.reduce((sum, item) => sum + Number(item.debit_amount || 0), 0);
    const totalCredit = items.reduce((sum, item) => sum + Number(item.credit_amount || 0), 0);
    return { totalDebit, totalCredit, difference: totalDebit - totalCredit };
  };

  const [totals, setTotals] = useState(calculateTotals());

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name?.includes("items")) {
        setTotals(calculateTotals());
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  const onSubmit = async (values: JournalEntryFormValues) => {
    try {
      setIsSubmitting(true);

      const totalAmount = values.items.reduce(
        (sum, item) => sum + Number(item.debit_amount || 0),
        0
      );

      // If we have an existing entry, update it
      if (entry) {
        const { data, error } = await supabase
          .from("accounting_journal_entries")
          .update({
            date: values.date,
            reference_number: values.reference_number,
            description: values.description,
            status: values.status,
            total_amount: totalAmount,
            updated_at: new Date().toISOString(),
          })
          .eq("id", entry.id);

        if (error) throw error;

        // Update or create each journal item
        for (const item of values.items) {
          if (item.id) {
            // Update existing item
            const { error } = await supabase
              .from("accounting_journal_items")
              .update({
                account_id: item.account_id,
                description: item.description,
                debit_amount: item.debit_amount || 0,
                credit_amount: item.credit_amount || 0,
              })
              .eq("id", item.id);

            if (error) throw error;
          } else {
            // Create new item
            const { error } = await supabase.from("accounting_journal_items").insert({
              journal_entry_id: entry.id,
              account_id: item.account_id,
              description: item.description,
              debit_amount: item.debit_amount || 0,
              credit_amount: item.credit_amount || 0,
            });

            if (error) throw error;
          }
        }

        // Delete any items that were removed
        const existingItemIds = entry.items.map((item: any) => item.id);
        const updatedItemIds = values.items
          .filter(item => item.id)
          .map(item => item.id);
        
        const itemsToDelete = existingItemIds.filter(
          (id: string) => !updatedItemIds.includes(id)
        );

        if (itemsToDelete.length > 0) {
          const { error } = await supabase
            .from("accounting_journal_items")
            .delete()
            .in("id", itemsToDelete);

          if (error) throw error;
        }
      } else {
        // Create a new journal entry
        const { data: entryData, error: entryError } = await supabase
          .from("accounting_journal_entries")
          .insert({
            date: values.date,
            reference_number: values.reference_number,
            description: values.description,
            status: values.status,
            total_amount: totalAmount,
          })
          .select("id");

        if (entryError) throw entryError;

        const newEntryId = entryData[0].id;

        // Add all journal items
        const journalItems = values.items.map(item => ({
          journal_entry_id: newEntryId,
          account_id: item.account_id,
          description: item.description,
          debit_amount: item.debit_amount || 0,
          credit_amount: item.credit_amount || 0,
        }));

        const { error: itemsError } = await supabase
          .from("accounting_journal_items")
          .insert(journalItems);

        if (itemsError) throw itemsError;
      }

      // Invalidate and refetch journal entries
      queryClient.invalidateQueries({ queryKey: ["accounting_journal_entries"] });
      toast.success(entry ? "تم تحديث القيد بنجاح" : "تم إنشاء القيد بنجاح");
      onSuccess();
    } catch (error: any) {
      console.error("Error saving journal entry:", error);
      toast.error(`حدث خطأ: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addItem = () => {
    append({
      account_id: "",
      description: "",
      debit_amount: 0,
      credit_amount: 0,
    });
  };

  if (isLoadingAccounts) {
    return <div>جاري تحميل الحسابات...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>التاريخ</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reference_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>الرقم المرجعي</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>الحالة</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الحالة" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">مسودة</SelectItem>
                    <SelectItem value="posted">مرحل</SelectItem>
                    <SelectItem value="cancelled">ملغى</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الوصف</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">عناصر القيد</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addItem}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" /> إضافة عنصر
            </Button>
          </div>

          <div className="border rounded-md p-4">
            <div className="grid grid-cols-12 gap-2 mb-2 font-medium text-sm">
              <div className="col-span-5">الحساب</div>
              <div className="col-span-3">الوصف</div>
              <div className="col-span-1.5 text-center">المدين</div>
              <div className="col-span-1.5 text-center">الدائن</div>
              <div className="col-span-1"></div>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-12 gap-2 mb-4">
                <div className="col-span-5">
                  <FormField
                    control={form.control}
                    name={`items.${index}.account_id`}
                    render={({ field }) => (
                      <FormItem className="space-y-0">
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
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
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-3">
                  <FormField
                    control={form.control}
                    name={`items.${index}.description`}
                    render={({ field }) => (
                      <FormItem className="space-y-0">
                        <FormControl>
                          <Input {...field} placeholder="الوصف" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-1.5">
                  <FormField
                    control={form.control}
                    name={`items.${index}.debit_amount`}
                    render={({ field }) => (
                      <FormItem className="space-y-0">
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              if (e.target.value) {
                                form.setValue(
                                  `items.${index}.credit_amount`,
                                  0
                                );
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-1.5">
                  <FormField
                    control={form.control}
                    name={`items.${index}.credit_amount`}
                    render={({ field }) => (
                      <FormItem className="space-y-0">
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              if (e.target.value) {
                                form.setValue(
                                  `items.${index}.debit_amount`,
                                  0
                                );
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-1 flex items-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={fields.length === 1}
                    onClick={() => remove(index)}
                    className="text-red-500 p-0 h-auto hover:bg-transparent hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            <div className="grid grid-cols-12 gap-2 pt-4 border-t">
              <div className="col-span-5 font-medium text-left">المجموع</div>
              <div className="col-span-3"></div>
              <div className="col-span-1.5 font-medium text-center">
                {totals.totalDebit.toFixed(2)}
              </div>
              <div className="col-span-1.5 font-medium text-center">
                {totals.totalCredit.toFixed(2)}
              </div>
              <div className="col-span-1"></div>
            </div>

            {Math.abs(totals.difference) > 0.001 && (
              <div
                className={`grid grid-cols-12 gap-2 mt-2 pt-2 border-t ${
                  Math.abs(totals.difference) > 0.001
                    ? "text-red-500"
                    : "text-green-500"
                }`}
              >
                <div className="col-span-5 font-medium text-left">الفرق</div>
                <div className="col-span-3"></div>
                <div className="col-span-3 font-medium text-center">
                  {Math.abs(totals.difference).toFixed(2)}
                </div>
                <div className="col-span-1"></div>
              </div>
            )}
          </div>
          {form.formState.errors.items?.root && (
            <p className="text-sm font-medium text-destructive mt-1">
              {form.formState.errors.items.root.message}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            إلغاء
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "جاري الحفظ..."
              : entry
              ? "تحديث القيد"
              : "إنشاء القيد"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
