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
import { Invoice, InvoiceItem, useInvoices } from "@/hooks/accounting/useInvoices";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { format } from "date-fns";
import { X, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const InvoiceItemSchema = z.object({
  description: z.string().min(1, "الوصف مطلوب"),
  quantity: z.coerce.number().min(1, "الكمية يجب أن تكون أكبر من صفر"),
  unit_price: z.coerce.number().min(0, "السعر يجب أن يكون أكبر من أو يساوي صفر"),
  total: z.coerce.number(),
});

const InvoiceSchema = z.object({
  invoice_number: z.string().min(1, "رقم الفاتورة مطلوب"),
  date: z.string().min(1, "تاريخ الفاتورة مطلوب"),
  due_date: z.string().min(1, "تاريخ الاستحقاق مطلوب"),
  customer_name: z.string().min(1, "اسم العميل/المورد مطلوب"),
  customer_address: z.string().optional(),
  customer_phone: z.string().optional(),
  customer_email: z.string().email("البريد الإلكتروني غير صحيح").optional().or(z.string().length(0)),
  invoice_type: z.enum(["sales", "purchase"]),
  status: z.enum(["draft", "sent", "paid", "cancelled"]),
  subtotal: z.coerce.number(),
  tax_rate: z.coerce.number().min(0).max(100),
  tax_amount: z.coerce.number(),
  total_amount: z.coerce.number(),
  notes: z.string().optional(),
  items: z.array(InvoiceItemSchema).min(1, "يجب إضافة عنصر واحد على الأقل"),
  account_id: z.string().optional(),
  cost_center_id: z.string().optional(),
});

type InvoiceFormValues = z.infer<typeof InvoiceSchema>;

interface InvoiceFormProps {
  invoice?: Invoice | null;
  onCancel: () => void;
  onSuccess: () => void;
}

export const InvoiceForm = ({ invoice, onCancel, onSuccess }: InvoiceFormProps) => {
  const { createInvoice, updateInvoice } = useInvoices();
  const [items, setItems] = useState<InvoiceItem[]>(invoice?.items || []);

  const defaultValues: InvoiceFormValues = {
    invoice_number: invoice?.invoice_number || "",
    date: invoice?.date || format(new Date(), "yyyy-MM-dd"),
    due_date: invoice?.due_date || format(new Date(), "yyyy-MM-dd"),
    customer_name: invoice?.customer_name || "",
    customer_address: invoice?.customer_address || "",
    customer_phone: invoice?.customer_phone || "",
    customer_email: invoice?.customer_email || "",
    invoice_type: invoice?.invoice_type || "sales",
    status: invoice?.status || "draft",
    subtotal: invoice?.subtotal || 0,
    tax_rate: invoice?.tax_rate || 15,
    tax_amount: invoice?.tax_amount || 0,
    total_amount: invoice?.total_amount || 0,
    notes: invoice?.notes || "",
    items: invoice?.items || [],
    account_id: invoice?.account_id || "",
    cost_center_id: invoice?.cost_center_id || "",
  };

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(InvoiceSchema),
    defaultValues,
  });

  const onSubmit = async (data: InvoiceFormValues) => {
    try {
      if (invoice?.id) {
        await updateInvoice.mutateAsync({
          ...data,
          id: invoice.id,
        });
      } else {
        await createInvoice.mutateAsync(data);
      }
      onSuccess();
    } catch (error) {
      console.error("Error submitting invoice:", error);
    }
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      description: "",
      quantity: 1,
      unit_price: 0,
      total: 0,
    };
    setItems([...items, newItem]);
    form.setValue("items", [...items, newItem]);
  };

  const removeItem = (index: number) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);
    form.setValue("items", updatedItems);
    calculateTotals(updatedItems);
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };

    if (field === "quantity" || field === "unit_price") {
      const quantity = field === "quantity" ? value : updatedItems[index].quantity;
      const unitPrice = field === "unit_price" ? value : updatedItems[index].unit_price;
      updatedItems[index].total = quantity * unitPrice;
    }

    setItems(updatedItems);
    form.setValue("items", updatedItems);
    calculateTotals(updatedItems);
  };

  const calculateTotals = (itemsList: InvoiceItem[]) => {
    const subtotal = itemsList.reduce((sum, item) => sum + (item.total || 0), 0);
    const taxRate = form.getValues("tax_rate") || 0;
    const taxAmount = subtotal * (taxRate / 100);
    const totalAmount = subtotal + taxAmount;

    form.setValue("subtotal", subtotal);
    form.setValue("tax_amount", taxAmount);
    form.setValue("total_amount", totalAmount);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="invoice_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>رقم الفاتورة</FormLabel>
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
                <FormLabel>تاريخ الفاتورة</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="due_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>تاريخ الاستحقاق</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="invoice_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>نوع الفاتورة</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع الفاتورة" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="sales">فاتورة مبيعات</SelectItem>
                    <SelectItem value="purchase">فاتورة مشتريات</SelectItem>
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
                <FormLabel>حالة الفاتورة</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر حالة الفاتورة" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">مسودة</SelectItem>
                    <SelectItem value="sent">مرسلة</SelectItem>
                    <SelectItem value="paid">مدفوعة</SelectItem>
                    <SelectItem value="cancelled">ملغاة</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator className="my-4" />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">معلومات العميل / المورد</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="customer_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم العميل / المورد</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customer_phone"
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
              name="customer_email"
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
              name="customer_address"
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
            <h3 className="text-lg font-medium">بنود الفاتورة</h3>
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
                      <TableHead className="text-right">الكمية</TableHead>
                      <TableHead className="text-right">سعر الوحدة</TableHead>
                      <TableHead className="text-right">الإجمالي</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center h-20">
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
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              updateItem(index, "quantity", Number(e.target.value))
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unit_price}
                            onChange={(e) =>
                              updateItem(index, "unit_price", Number(e.target.value))
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            readOnly
                            value={item.total}
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
            <div className="flex justify-between">
              <span>المجموع قبل الضريبة:</span>
              <span>{form.watch("subtotal").toFixed(2)} ر.س</span>
            </div>

            <div className="flex justify-between items-center">
              <span>ضريبة القيمة المضافة:</span>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  className="w-20"
                  value={form.watch("tax_rate")}
                  onChange={(e) => {
                    const newRate = Number(e.target.value);
                    form.setValue("tax_rate", newRate);
                    calculateTotals(items);
                  }}
                />
                <span>%</span>
              </div>
            </div>

            <div className="flex justify-between">
              <span>قيمة الضريبة:</span>
              <span>{form.watch("tax_amount").toFixed(2)} ر.س</span>
            </div>

            <Separator />

            <div className="flex justify-between font-bold text-lg">
              <span>المجموع النهائي:</span>
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
            disabled={createInvoice.isPending || updateInvoice.isPending}
          >
            {createInvoice.isPending || updateInvoice.isPending
              ? "جاري الحفظ..."
              : invoice
              ? "تحديث الفاتورة"
              : "إنشاء الفاتورة"}
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

