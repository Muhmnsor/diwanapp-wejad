
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";

const formSchema = z.object({
  platform_name: z.string().min(1, "اسم المنصة مطلوب"),
  account_name: z.string().min(1, "اسم الحساب مطلوب"),
  username: z.string().min(1, "اسم المستخدم مطلوب"),
  password: z.string().optional(),
  website_url: z.string().optional(),
  responsible_person: z.string().optional(),
  renewal_date: z.string().optional(),
  notes: z.string().optional(),
  category: z.string().min(1, "تصنيف الحساب مطلوب"),
  access_level: z.string().min(1, "مستوى الوصول مطلوب"),
});

interface AccountFormProps {
  accountId?: string;
  initialData?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export const AccountForm = ({ accountId, initialData, onSuccess, onCancel }: AccountFormProps) => {
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      platform_name: "",
      account_name: "",
      username: "",
      password: "",
      website_url: "",
      responsible_person: "",
      renewal_date: "",
      notes: "",
      category: "social",
      access_level: "admin",
    },
  });
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      const data = {
        ...values,
        created_by: user.id,
        updated_by: user.id,
      };
      
      if (accountId) {
        // Update existing account
        const { error } = await supabase
          .from("digital_accounts")
          .update(data)
          .eq("id", accountId);
          
        if (error) throw error;
        toast.success("تم تحديث الحساب بنجاح");
      } else {
        // Create new account
        const { error } = await supabase
          .from("digital_accounts")
          .insert([data]);
          
        if (error) throw error;
        toast.success("تم إضافة الحساب بنجاح");
      }
      
      onSuccess();
      form.reset();
    } catch (error) {
      console.error("Error submitting account:", error);
      toast.error("حدث خطأ أثناء حفظ الحساب");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="platform_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>اسم المنصة</FormLabel>
                <FormControl>
                  <Input placeholder="مثال: تويتر، فيسبوك..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="account_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>اسم الحساب</FormLabel>
                <FormControl>
                  <Input placeholder="الاسم الظاهر للحساب" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>اسم المستخدم</FormLabel>
                <FormControl>
                  <Input placeholder="اسم المستخدم أو البريد الإلكتروني" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>كلمة المرور (اختياري)</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="كلمة المرور" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>تصنيف الحساب</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر تصنيف" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="social">منصات التواصل الاجتماعي</SelectItem>
                    <SelectItem value="apps">التطبيقات والخدمات</SelectItem>
                    <SelectItem value="email">البريد الإلكتروني</SelectItem>
                    <SelectItem value="financial">حسابات مالية</SelectItem>
                    <SelectItem value="other">أخرى</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="access_level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>مستوى الوصول</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر مستوى الوصول" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="admin">مدير</SelectItem>
                    <SelectItem value="editor">محرر</SelectItem>
                    <SelectItem value="viewer">مشاهد</SelectItem>
                    <SelectItem value="restricted">مقيد</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="website_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>رابط الموقع (اختياري)</FormLabel>
                <FormControl>
                  <Input placeholder="https://..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="responsible_person"
            render={({ field }) => (
              <FormItem>
                <FormLabel>الشخص المسؤول (اختياري)</FormLabel>
                <FormControl>
                  <Input placeholder="اسم الشخص المسؤول" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="renewal_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>تاريخ التجديد (اختياري)</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ملاحظات (اختياري)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="أي ملاحظات إضافية حول الحساب..." 
                  className="min-h-[100px]" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            إلغاء
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "جاري الحفظ..." : accountId ? "تحديث الحساب" : "إضافة الحساب"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
