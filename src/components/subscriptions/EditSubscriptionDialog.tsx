
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Calendar, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

const subscriptionSchema = z.object({
  name: z.string().min(1, "اسم الاشتراك مطلوب"),
  description: z.string().optional(),
  provider: z.string().optional(),
  category: z.string().min(1, "فئة الاشتراك مطلوبة"),
  cost: z.string().optional(),
  currency: z.string().default("SAR"),
  billing_cycle: z.string().min(1, "دورة الفوترة مطلوبة"),
  start_date: z.string().optional(),
  expiry_date: z.string().optional(),
  renewal_date: z.string().optional(),
  status: z.string().optional(),
  payment_method: z.string().optional(),
  contact_name: z.string().optional(),
  contact_email: z.string().optional(),
  contact_phone: z.string().optional(),
  notes: z.string().optional(),
});

type SubscriptionFormValues = z.infer<typeof subscriptionSchema>;

interface Subscription {
  id: string;
  name: string;
  description: string | null;
  provider: string | null;
  category: string;
  cost: number | null;
  currency: string;
  billing_cycle: string;
  start_date: string | null;
  expiry_date: string | null;
  renewal_date: string | null;
  status: string;
  payment_method: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  notes: string | null;
}

interface EditSubscriptionDialogProps {
  subscription: Subscription | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export const EditSubscriptionDialog = ({ 
  subscription, 
  open, 
  onOpenChange, 
  onUpdate 
}: EditSubscriptionDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const form = useForm<SubscriptionFormValues>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      name: "",
      description: "",
      provider: "",
      category: "",
      cost: "",
      currency: "SAR",
      billing_cycle: "",
      start_date: "",
      expiry_date: "",
      renewal_date: "",
      status: "active",
      payment_method: "",
      contact_name: "",
      contact_email: "",
      contact_phone: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (subscription) {
      form.reset({
        name: subscription.name,
        description: subscription.description || "",
        provider: subscription.provider || "",
        category: subscription.category,
        cost: subscription.cost?.toString() || "",
        currency: subscription.currency,
        billing_cycle: subscription.billing_cycle,
        start_date: subscription.start_date || "",
        expiry_date: subscription.expiry_date || "",
        renewal_date: subscription.renewal_date || "",
        status: subscription.status,
        payment_method: subscription.payment_method || "",
        contact_name: subscription.contact_name || "",
        contact_email: subscription.contact_email || "",
        contact_phone: subscription.contact_phone || "",
        notes: subscription.notes || "",
      });
    }
  }, [subscription, form]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB
        toast.error('حجم الملف يجب أن لا يتجاوز 10 ميجابايت');
        return;
      }
      setSelectedFile(file);
    }
  };

  const onSubmit = async (data: SubscriptionFormValues) => {
    if (!subscription) return;
    
    setIsLoading(true);
    try {
      // Convert cost from string to number
      const numericCost = data.cost ? parseFloat(data.cost) : null;
      
      // Update subscription data
      const { error } = await supabase
        .from('subscriptions')
        .update({
          ...data,
          cost: numericCost,
        })
        .eq('id', subscription.id);

      if (error) throw error;
      
      // Upload attachment if a file is selected
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `subscriptions/${subscription.id}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, selectedFile);
        
        if (uploadError) {
          console.error('Error uploading file:', uploadError);
          toast.error('حدث خطأ أثناء رفع المرفق');
        } else {
          // Get public URL for the file
          const { data: { publicUrl } } = supabase.storage
            .from('documents')
            .getPublicUrl(filePath);
          
          // Save attachment metadata
          const { error: attachmentError } = await supabase
            .from('subscription_attachments')
            .insert([
              {
                subscription_id: subscription.id,
                file_name: selectedFile.name,
                file_path: filePath,
                file_type: selectedFile.type,
                file_size: selectedFile.size,
                uploaded_by: (await supabase.auth.getUser()).data.user?.id,
              },
            ]);
          
          if (attachmentError) {
            console.error('Error saving attachment metadata:', attachmentError);
            toast.error('حدث خطأ أثناء حفظ معلومات المرفق');
          }
        }
      }
      
      toast.success('تم تحديث الاشتراك بنجاح');
      setSelectedFile(null);
      onOpenChange(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast.error('حدث خطأ أثناء تحديث الاشتراك');
    } finally {
      setIsLoading(false);
    }
  };

  if (!subscription) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>تعديل اشتراك</DialogTitle>
          <DialogDescription>
            قم بتعديل تفاصيل الاشتراك "{subscription.name}".
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Basic Information */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>اسم الاشتراك</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="أدخل اسم الاشتراك" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="provider"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>مزود الخدمة</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="أدخل اسم مزود الخدمة" />
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
                    <FormLabel>فئة الاشتراك</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الفئة" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="تقنية">تقنية</SelectItem>
                        <SelectItem value="برمجيات">برمجيات</SelectItem>
                        <SelectItem value="استضافة">استضافة</SelectItem>
                        <SelectItem value="دومين">دومين</SelectItem>
                        <SelectItem value="خدمات سحابية">خدمات سحابية</SelectItem>
                        <SelectItem value="عضوية">عضوية</SelectItem>
                        <SelectItem value="أخرى">أخرى</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Financial Information */}
              <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>التكلفة</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" placeholder="أدخل التكلفة" step="0.01" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="billing_cycle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>دورة الفوترة</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر دورة الفوترة" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="شهري">شهري</SelectItem>
                        <SelectItem value="ربع سنوي">ربع سنوي</SelectItem>
                        <SelectItem value="نصف سنوي">نصف سنوي</SelectItem>
                        <SelectItem value="سنوي">سنوي</SelectItem>
                        <SelectItem value="مرة واحدة">مرة واحدة</SelectItem>
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
                        <SelectItem value="active">نشط</SelectItem>
                        <SelectItem value="expired">منتهي</SelectItem>
                        <SelectItem value="cancelled">ملغي</SelectItem>
                        <SelectItem value="pending">معلق</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                        <SelectItem value="بطاقة ائتمان">بطاقة ائتمان</SelectItem>
                        <SelectItem value="تحويل بنكي">تحويل بنكي</SelectItem>
                        <SelectItem value="باي بال">باي بال</SelectItem>
                        <SelectItem value="أخرى">أخرى</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Dates */}
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تاريخ البدء</FormLabel>
                    <FormControl>
                      <div className="flex">
                        <Input
                          {...field}
                          type="date"
                          className="rtl"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="mr-2"
                          onClick={() => field.onChange(new Date().toISOString().split('T')[0])}
                        >
                          <Calendar className="h-4 w-4" />
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expiry_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تاريخ الانتهاء</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" className="rtl" />
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
                    <FormLabel>تاريخ التجديد</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" className="rtl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Contact Information */}
              <FormField
                control={form.control}
                name="contact_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم جهة الاتصال</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="أدخل اسم جهة الاتصال" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contact_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>البريد الإلكتروني للاتصال</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="أدخل البريد الإلكتروني" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contact_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم الهاتف للاتصال</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="أدخل رقم الهاتف" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description & Notes */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>الوصف</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="أدخل وصف الاشتراك" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>ملاحظات</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="أدخل أي ملاحظات إضافية" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Attachment Upload */}
            <div className="space-y-2">
              <FormLabel>إضافة مرفق جديد</FormLabel>
              <div className="border border-dashed rounded-md p-4">
                <Input
                  id="file-upload"
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <Upload className="h-10 w-10 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600 mb-1">انقر لتحميل مرفق</span>
                  <span className="text-xs text-gray-500">(عقد، فاتورة، مستند)</span>
                </label>
                {selectedFile && (
                  <div className="mt-2 text-sm text-gray-700 text-center">
                    {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
