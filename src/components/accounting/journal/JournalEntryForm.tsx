
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash } from "lucide-react";
import { useAccounts } from "@/hooks/accounting/useAccounts";
import { useState, useEffect } from "react";

const journalItemSchema = z.object({
  account_id: z.string().min(1, "الحساب مطلوب"),
  description: z.string().optional(),
  debit_amount: z.string().refine(
    (val) => !isNaN(Number(val)) && Number(val) >= 0,
    "يجب أن يكون المبلغ رقمًا موجبًا"
  ),
  credit_amount: z.string().refine(
    (val) => !isNaN(Number(val)) && Number(val) >= 0,
    "يجب أن يكون المبلغ رقمًا موجبًا"
  ),
  cost_center_id: z.string().optional(),
});

const journalEntrySchema = z.object({
  date: z.string(),
  reference_number: z.string().optional(),
  description: z.string().min(3, "الوصف مطلوب"),
  status: z.string().default("draft"),
  items: z.array(journalItemSchema)
    .min(2, "يجب إضافة سطرين على الأقل للقيد المحاسبي")
    .refine(
      (items) => {
        const totalDebit = items.reduce(
          (sum, item) => sum + Number(item.debit_amount || 0), 
          0
        );
        const totalCredit = items.reduce(
          (sum, item) => sum + Number(item.credit_amount || 0), 
          0
        );
        return Math.abs(totalDebit - totalCredit) < 0.001; // إضافة هامش خطأ صغير للأرقام العشرية
      },
      {
        message: "يجب أن يكون مجموع المدين مساويًا لمجموع الدائن",
      }
    ),
});

interface JournalEntryFormProps {
  entry?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export const JournalEntryForm = ({
  entry,
  onSuccess,
  onCancel,
}: JournalEntryFormProps) => {
  const { toast } = useToast();
  const { accounts } = useAccounts();
  
  const [totalDebit, setTotalDebit] = useState(0);
  const [totalCredit, setTotalCredit] = useState(0);
  const [isBalanced, setIsBalanced] = useState(false);

  const defaultItems = entry?.items?.length 
    ? entry.items 
    : [
        { account_id: "", description: "", debit_amount: "0", credit_amount: "0" },
        { account_id: "", description: "", debit_amount: "0", credit_amount: "0" },
      ];

  const form = useForm<z.infer<typeof journalEntrySchema>>({
    resolver: zodResolver(journalEntrySchema),
    defaultValues: {
      date: entry?.date || new Date().toISOString().split('T')[0],
      reference_number: entry?.reference_number || "",
      description: entry?.description || "",
      status: entry?.status || "draft",
      items: defaultItems,
    },
  });

  // Use useFieldArray to handle the array of journal items
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Calculate totals when form values change
  useEffect(() => {
    const values = form.watch();
    const debit = values.items?.reduce(
      (sum, item) => sum + Number(item.debit_amount || 0),
      0
    ) || 0;
    
    const credit = values.items?.reduce(
      (sum, item) => sum + Number(item.credit_amount || 0),
      0
    ) || 0;
    
    setTotalDebit(debit);
    setTotalCredit(credit);
    setIsBalanced(Math.abs(debit - credit) < 0.001);
  }, [form.watch()]);

  const onSubmit = async (data: z.infer<typeof journalEntrySchema>) => {
    try {
      console.log("Form submitted:", data);
      // Implement journal entry save logic here
      toast({
        title: entry ? "تم تحديث القيد المحاسبي بنجاح" : "تم إنشاء القيد المحاسبي بنجاح",
      });
      onSuccess();
    } catch (error) {
      console.error("Error saving journal entry:", error);
      toast({
        title: "حدث خطأ أثناء حفظ القيد المحاسبي",
        variant: "destructive",
      });
    }
  };

  const addNewRow = () => {
    append({
      account_id: "",
      description: "",
      debit_amount: "0",
      credit_amount: "0"
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-right block">التاريخ</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage className="text-right" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reference_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-right block">الرقم المرجعي</FormLabel>
                <FormControl>
                  <Input dir="rtl" placeholder="رقم مرجعي اختياري" {...field} />
                </FormControl>
                <FormMessage className="text-right" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-right block">الحالة</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  dir="rtl"
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر حالة القيد" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">مسودة</SelectItem>
                    <SelectItem value="posted">مرحل</SelectItem>
                    <SelectItem value="cancelled">ملغى</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="text-right" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="col-span-full">
                <FormLabel className="text-right block">الوصف</FormLabel>
                <FormControl>
                  <Textarea 
                    dir="rtl" 
                    placeholder="وصف القيد المحاسبي" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage className="text-right" />
              </FormItem>
            )}
          />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الحساب</TableHead>
                <TableHead className="text-right">الوصف</TableHead>
                <TableHead className="text-right w-[150px]">مدين</TableHead>
                <TableHead className="text-right w-[150px]">دائن</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((field, index) => (
                <TableRow key={field.id}>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name={`items.${index}.account_id`}
                      render={({ field }) => (
                        <FormItem>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            dir="rtl"
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر الحساب" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {accounts?.map((account) => (
                                <SelectItem key={account.id} value={account.id}>
                                  {account.code} - {account.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name={`items.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input dir="rtl" placeholder="وصف البند (اختياري)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name={`items.${index}.debit_amount`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              min="0"
                              placeholder="0.00" 
                              className="text-left"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                if (e.target.value) {
                                  form.setValue(`items.${index}.credit_amount`, "0");
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name={`items.${index}.credit_amount`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              min="0"
                              placeholder="0.00" 
                              className="text-left"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                if (e.target.value) {
                                  form.setValue(`items.${index}.debit_amount`, "0");
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-red-500"
                      disabled={fields.length <= 2} // منع حذف السطور إذا كان هناك سطرين فقط
                      onClick={() => remove(index)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              
              <TableRow>
                <TableCell colSpan={2} className="text-left font-medium">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addNewRow}
                    className="mr-2"
                  >
                    <Plus className="h-4 w-4 mr-1" /> إضافة سطر
                  </Button>
                </TableCell>
                <TableCell className="text-right font-bold">
                  {totalDebit.toFixed(2)}
                </TableCell>
                <TableCell className="text-right font-bold">
                  {totalCredit.toFixed(2)}
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
              
              <TableRow>
                <TableCell colSpan={2}>
                  <div className={`text-right font-medium ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                    {isBalanced ? '✓ القيد متوازن' : '✗ القيد غير متوازن'}
                  </div>
                </TableCell>
                <TableCell colSpan={3} className="text-right">
                  <div className="text-sm text-muted-foreground">
                    الفرق: {Math.abs(totalDebit - totalCredit).toFixed(2)}
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button type="button" variant="outline" onClick={onCancel}>
            إلغاء
          </Button>
          <Button type="submit" disabled={!isBalanced}>
            {entry ? "تحديث القيد" : "حفظ القيد"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

// السماح للمكونات الضرورية
const Table = ({ children }: { children: React.ReactNode }) => (
  <table className="w-full">{children}</table>
);

const TableHeader = ({ children }: { children: React.ReactNode }) => (
  <thead className="bg-muted/50 [&_tr]:border-b">{children}</thead>
);

const TableBody = ({ children }: { children: React.ReactNode }) => (
  <tbody className="[&_tr:last-child]:border-0">{children}</tbody>
);

const TableRow = ({ children, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
  <tr
    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
    {...props}
  >
    {children}
  </tr>
);

const TableHead = ({ 
  className, 
  children,
  ...props 
}: React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th
    className={`h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 ${className || ''}`}
    {...props}
  >
    {children}
  </th>
);

const TableCell = ({ 
  className, 
  children,
  ...props 
}: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td
    className={`p-2 align-middle [&:has([role=checkbox])]:pr-0 ${className || ''}`}
    {...props}
  >
    {children}
  </td>
);
