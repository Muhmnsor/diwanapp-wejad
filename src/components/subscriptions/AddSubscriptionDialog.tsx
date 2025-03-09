
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { useAuthStore } from "@/store/authStore";
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
  payment_method: z.string().optional(),
  contact_name: z.string().optional(),
  contact_email: z.string().optional(),
  contact_phone: z.string().optional(),
  notes: z.string().optional(),
});

interface AddSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const AddSubscriptionDialog = ({ 
  open, 
  onOpenChange, 
  onSuccess 
}: AddSubscriptionDialogProps) => {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const form = useForm<z.infer<typeof subscriptionSchema>>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      name: "",
      description: "",
      provider: "",
      category: "تقنية",
      cost: "",
      currency: "SAR",
      billing_cycle: "شهري",
      payment_method: "",
      contact_name: "",
      contact_email: "",
      contact_phone: "",
      notes: "",
    },
  });

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

  const onSubmit = async (data: z.infer<typeof subscriptionSchema>) => {
    if (!user) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }

    setIsLoading(true);
    try {
      // Convert cost from string to number
      const numericCost = data.cost ? parseFloat(data.cost) : null;
      
      // Insert subscription data
      const { data: newSubscription, error } = await supabase
        .from('subscriptions')
        .insert([
          {
            ...data,
            cost: numericCost,
            created_by: user.id,
          },
        ])
        .select();

      if (error) throw error;
      
      // Upload attachment if a file is selected
      if (selectedFile && newSubscription?.[0]?.id) {
        const subscriptionId = newSubscription[0].id;
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `subscriptions/${subscriptionId}/${fileName}`;
        
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
                subscription_id: subscriptionId,
                file_name: selectedFile.name,
                file_path: filePath,
                file_type: selectedFile.type,
                file_size: selectedFile.size,
                uploaded_by: user.id,
              },
            ]);
          
          if (attachmentError) {
            console.error('Error saving attachment metadata:', attachmentError);
            toast.error('حدث خطأ أثناء حفظ معلومات المرفق');
          }
        }
      }
      
      toast.success('تم إضافة الاشتراك بنجاح');
      form.reset();
      setSelectedFile(null);
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Error submitting subscription:', error);
      toast.error('حدث خطأ أثناء إضافة الاشتراك');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>إضافة اشتراك جديد</DialogTitle>
          <DialogDescription>
            أدخل تفاصيل الاشتراك الجديد هنا.
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
              <FormLabel>المرفقات</FormLabel>
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
                {isLoading ? 'جاري الحفظ...' : 'حفظ الاشتراك'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
