
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAccountsOperations } from "@/hooks/accounting/useAccountsOperations";

const accountSchema = z.object({
  code: z.string().min(1, "رمز الحساب مطلوب"),
  name: z.string().min(2, "اسم الحساب مطلوب ويجب أن يتكون من حرفين على الأقل"),
  account_type: z.string().min(1, "نوع الحساب مطلوب"),
  parent_id: z.string().optional(),
  is_active: z.boolean().default(true),
  notes: z.string().optional(),
});

type AccountFormProps = {
  account?: any;
  onSuccess: () => void;
  onCancel: () => void;
};

export const AccountForm = ({ account, onSuccess, onCancel }: AccountFormProps) => {
  const { toast } = useToast();
  const { createAccount, updateAccount } = useAccountsOperations();

  const form = useForm<z.infer<typeof accountSchema>>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      code: account?.code || "",
      name: account?.name || "",
      account_type: account?.account_type || "",
      parent_id: account?.parent_id || "",
      is_active: account?.is_active ?? true,
      notes: account?.notes || "",
    },
  });

  const onSubmit = async (data: z.infer<typeof accountSchema>) => {
    try {
      if (account) {
        await updateAccount(account.id, data);
        toast({
          title: "تم تحديث الحساب بنجاح",
        });
      } else {
        await createAccount(data);
        toast({
          title: "تم إنشاء الحساب بنجاح",
        });
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving account:", error);
      toast({
        title: "حدث خطأ أثناء حفظ الحساب",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-right block">رمز الحساب</FormLabel>
                <FormControl>
                  <Input dir="rtl" placeholder="مثال: 1.1.1" {...field} />
                </FormControl>
                <FormDescription className="text-right">
                  أدخل رمز الحساب حسب هيكل الحسابات المعتمد
                </FormDescription>
                <FormMessage className="text-right" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-right block">اسم الحساب</FormLabel>
                <FormControl>
                  <Input dir="rtl" placeholder="اسم الحساب" {...field} />
                </FormControl>
                <FormMessage className="text-right" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="account_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-right block">نوع الحساب</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  dir="rtl"
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع الحساب" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="asset">أصول</SelectItem>
                    <SelectItem value="liability">التزامات</SelectItem>
                    <SelectItem value="equity">حقوق الملكية</SelectItem>
                    <SelectItem value="revenue">إيرادات</SelectItem>
                    <SelectItem value="expense">مصروفات</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="text-right" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="parent_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-right block">الحساب الرئيسي (اختياري)</FormLabel>
                <FormControl>
                  <Input dir="rtl" placeholder="اترك فارغًا للحسابات الرئيسية" {...field} />
                </FormControl>
                <FormMessage className="text-right" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem className="col-span-full">
                <FormLabel className="text-right block">ملاحظات</FormLabel>
                <FormControl>
                  <Textarea 
                    dir="rtl" 
                    placeholder="ملاحظات اختيارية حول الحساب" 
                    className="min-h-[100px]" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage className="text-right" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">حساب نشط</FormLabel>
                  <FormDescription>
                    عند إلغاء تنشيط الحساب، سيتم إخفاؤه من القوائم النشطة
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button type="button" variant="outline" onClick={onCancel}>
            إلغاء
          </Button>
          <Button type="submit">
            {account ? "تحديث الحساب" : "إضافة الحساب"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
