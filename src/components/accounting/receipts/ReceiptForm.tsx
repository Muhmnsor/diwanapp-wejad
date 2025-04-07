import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Receipt, ReceiptItem, useReceipts } from "@/hooks/accounting/useReceipts";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { format } from "date-fns";
import { X, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const ReceiptItemSchema = z.object({
  description: z.string().min(1, "الوصف مطلوب"),
  amount: z.coerce.number().min(0, "المبلغ يجب أن يكون أكبر من أو يساوي صفر"),
});

const ReceiptSchema = z.object({
  receipt_number: z.string().min(1, "رقم السند مطلوب"),
  date: z.string().min(1, "تاريخ السند مطلوب"),
  payer_name: z.string().min(1, "اسم الدافع مطلوب"),
  payer_address: z.string().optional(),
  payer_phone: z.string().optional(),
  payer_email: z.string().email("البريد الإلكتروني غير صحيح").optional().or(z.string().length(0)),
  receipt_type: z.enum(["revenue", "refund"]),
  payment_method: z.enum(["cash", "bank_transfer", "check", "credit_card"]),
  check_number: z.string().optional(),
  bank_account_number: z.string().optional(),
  total_amount: z.coerce.number().min(0, "المبلغ يجب أن يكون أكبر من أو يساوي صفر"),
  status: z.enum(["draft", "final", "cancelled"]),
  notes: z.string().optional(),
  items: z.array(ReceiptItemSchema).min(1, "يجب إضافة عنصر واحد على الأقل"),
  account_id: z.string().optional(),
  cost_center_id: z.string().optional(),
  invoice_id: z.string().optional(),
});

type ReceiptFormValues = z.infer<typeof ReceiptSchema>;

interface ReceiptFormProps {
  receipt?: Receipt | null;
  onCancel: () => void;
  onSuccess: () => void;
}

export const ReceiptForm = ({ receipt, onCancel, onSuccess }: ReceiptFormProps) => {
  const { createReceipt, updateReceipt } = useReceipts();
  const [items, setItems] = useState<ReceiptItem[]>(receipt?.items || []);

  const defaultValues: ReceiptFormValues = {
    receipt_number: receipt?.receipt_number || "",
    date: receipt?.date || format(new Date(), "yyyy-MM-dd"),
    payer_name: receipt?.payer_name || "",
    payer_address: receipt?.payer_address || "",
    payer_phone: receipt?.payer_phone || "",
    payer_email: receipt?.payer_email || "",
    receipt_type: receipt?.receipt_type || "revenue",
    payment_method: receipt?.payment_method || "cash",
    check_number: receipt?.check_number || "",
    bank_account_number: receipt?.bank_account_number || "",
    total_amount: receipt?.total_amount || 0,
    status: receipt?.status || "draft",
    notes: receipt?.notes || "",
    items: receipt?.items || [],
    account_id: receipt?.account_id || "",
    cost_center_id: receipt?.cost_center_id || "",
    invoice_id: receipt?.invoice_id || "",
  };

  const form = useForm<ReceiptFormValues>({
    resolver: zodResolver(ReceiptSchema),
    defaultValues,
  });

  const onSubmit = async (data: ReceiptFormValues) => {
    try {
      if (receipt?.id) {
        await updateReceipt.mutateAsync({
          ...data,
          id: receipt.id,
        });
      } else {
        await createReceipt.mutateAsync(data);
      }
      onSuccess();
    } catch (error) {
      console.error("Error submitting receipt:", error);
    }
  };

  const addItem = () => {
    const newItem: ReceiptItem = {
      description: "",
      amount: 0,
    };
    setItems([...items, newItem]);
    form.setValue("items", [...items, newItem]);
    calculateTotal([...items, newItem]);
  };

  const removeItem = (index: number) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);
    form.setValue("items", updatedItems);
    calculateTotal(updatedItems);
  };

  const updateItem = (index: number, field: keyof ReceiptItem, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };

    setItems(updatedItems);
    form.setValue("items", updatedItems);
    calculateTotal(updatedItems);
  };

  const calculateTotal = (itemsList: ReceiptItem[]) => {
    const total = itemsList.reduce((sum, item) => sum + (item.amount || 0), 0);
    form.setValue("total_amount", total);
  };

  const paymentMethod = form.watch("payment_method");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="receipt_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>رقم السند</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>تاريخ السند</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="receipt_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>نوع السند</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع السند" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="revenue">إيرادات</SelectItem>
                    <SelectItem value="refund">استرداد</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="payment_method"
            render={({ field }) => (
              <FormItem>
                <FormLabel>طريقة الدفع</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر طريقة الدفع" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="cash">نقدي</SelectItem>
                    <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                    <SelectItem value="check">شيك</SelectItem>
                    <SelectItem value="credit_card">بطاقة ائتمان</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>حالة السند</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر حالة السند" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">مسودة</SelectItem>
                    <SelectItem value="final">نهائي</SelectItem>
                    <SelectItem value="cancelled">ملغي</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {paymentMethod === "check" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="check_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رقم الشيك</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {paymentMethod === "bank_transfer" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="bank_account_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رقم الحساب البنكي</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <Separator className="my-4" />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">معلومات الدافع</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="payer_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم الدافع</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="payer_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رقم الهاتف</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="payer_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>البريد الإلكتروني</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="payer_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>العنوان</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator className="my-4" />

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">بنود السند</h3>
            <Button
              type="button"
              variant="outline"
              onClick={addItem}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              إضافة بند
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">الوصف</TableHead>
                      <TableHead className="text-right">المبلغ</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center h-20">
                          لا توجد بنود، قم بإضافة بند جديد
                        </TableCell>
                      </TableRow>
                    )}
                    {items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Input
                            value={item.description}
                            onChange={(e) =>
                              updateItem(index, "description", e.target.value)
                            }
                            placeholder="وصف البند"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.amount}
                            onChange={(e) =>
                              updateItem(index, "amount", Number(e.target.value))
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ملاحظات</FormLabel>
                  <FormControl>
                    <Textarea rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4 bg-gray-50 p-4 rounded-md">
            <div className="flex justify-between font-bold text-lg">
              <span>المجموع:</span>
              <span>{form.watch("total_amount").toFixed(2)} ر.س</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button type="button" variant="outline" onClick={onCancel}>
            إلغاء
          </Button>
          <Button
            type="submit"
            disabled={createReceipt.isPending || updateReceipt.isPending}
          >
            {createReceipt.isPending || updateReceipt.isPending
              ? "جاري الحفظ..."
              : receipt
              ? "تحديث السند"
              : "إنشاء السند"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

