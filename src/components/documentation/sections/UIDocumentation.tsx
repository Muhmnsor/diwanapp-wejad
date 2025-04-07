
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UIFeatureCard } from "../components/UIFeatureCard";
import { CodeBlock } from "../components/CodeBlock";

export const UIDocumentation = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>توثيق واجهة المستخدم</CardTitle>
          <CardDescription>مكونات واجهة المستخدم وكيفية استخدامها في النظام</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UIFeatureCard 
              title="مكونات shadcn/ui" 
              description="مكتبة مكونات واجهة المستخدم المستخدمة في النظام"
              features={[
                "مكونات قابلة للتخصيص والتوسيع",
                "تدعم الوضع الداكن والوضع الفاتح",
                "متوافقة مع معايير الوصول",
                "سهلة الاستخدام مع واجهة برمجية واضحة"
              ]}
            />
            
            <UIFeatureCard 
              title="توافقية الواجهة" 
              description="متطلبات توافق واجهة المستخدم"
              features={[
                "متوافقة مع مختلف أحجام الشاشات",
                "دعم اتجاه الكتابة من اليمين لليسار (RTL)",
                "تحسين للأداء وسرعة التحميل",
                "سهولة الوصول والاستخدام"
              ]}
            />
            
            <UIFeatureCard 
              title="أنماط Tailwind CSS" 
              description="استخدام إطار عمل Tailwind CSS للتنسيق"
              features={[
                "نهج قائم على الفئات للتصميم",
                "قابلية للتخصيص وفقًا لهوية العلامة التجارية",
                "أنماط متناسقة عبر جميع أجزاء التطبيق",
                "سهولة الصيانة والتعديل"
              ]}
            />
            
            <UIFeatureCard 
              title="الرسوم البيانية والمخططات" 
              description="مكتبات وأدوات لعرض البيانات بصريًا"
              features={[
                "رسوم بيانية تفاعلية باستخدام Recharts",
                "لوحات معلومات قابلة للتخصيص",
                "تحديث البيانات في الوقت الفعلي",
                "خيارات متعددة للعرض البصري"
              ]}
            />
          </div>
          
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">نماذج استخدام المكونات</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">مثال على استخدام مكون Button</h4>
                <CodeBlock 
                  code={`import { Button } from "@/components/ui/button";

// استخدام أساسي للزر
<Button>زر أساسي</Button>

// أنواع مختلفة من الأزرار
<Button variant="default">أساسي</Button>
<Button variant="destructive">حذف</Button>
<Button variant="outline">محدد</Button>
<Button variant="secondary">ثانوي</Button>
<Button variant="ghost">شبح</Button>
<Button variant="link">رابط</Button>

// أحجام مختلفة من الأزرار
<Button size="default">حجم عادي</Button>
<Button size="sm">حجم صغير</Button>
<Button size="lg">حجم كبير</Button>`}
                  language="tsx"
                />
              </div>
              
              <div>
                <h4 className="font-medium mb-2">مثال على استخدام Dialog (مربع حوار)</h4>
                <CodeBlock 
                  code={`import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

<Dialog>
  <DialogTrigger asChild>
    <Button>فتح مربع الحوار</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>عنوان مربع الحوار</DialogTitle>
      <DialogDescription>
        هذا وصف مربع الحوار. يمكنك وضع أي محتوى هنا.
      </DialogDescription>
    </DialogHeader>
    <div>محتوى مربع الحوار يذهب هنا</div>
  </DialogContent>
</Dialog>`}
                  language="tsx"
                />
              </div>
              
              <div>
                <h4 className="font-medium mb-2">مثال على استخدام Form (نموذج)</h4>
                <CodeBlock 
                  code={`import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// تعريف مخطط التحقق من صحة النموذج
const formSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يكون أكثر من حرفين"),
  email: z.string().email("البريد الإلكتروني غير صالح"),
});

// استخدام النموذج
function ProfileForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الاسم</FormLabel>
              <FormControl>
                <Input placeholder="أدخل اسمك" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>البريد الإلكتروني</FormLabel>
              <FormControl>
                <Input placeholder="أدخل بريدك الإلكتروني" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit">حفظ</Button>
      </form>
    </Form>
  );
}`}
                  language="tsx"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
