
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion } from "@/components/ui/accordion";
import { DocumentationSection } from "../components/DocumentationSection";
import { CodeBlock } from "../components/CodeBlock";

export const TechnicalDocumentation = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>التوثيق التقني</CardTitle>
        <CardDescription>معلومات تقنية عن هيكل النظام والتقنيات المستخدمة</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full space-y-4">
          <DocumentationSection
            title="التقنيات المستخدمة"
            content={[
              { title: "React & TypeScript", description: "إطار عمل واجهة المستخدم مع نظام أنواع قوي لتطوير أكثر استقرارًا" },
              { title: "Supabase", description: "قاعدة بيانات مفتوحة المصدر تعتمد على PostgreSQL وتوفر واجهات برمجية للمصادقة والتخزين والوظائف" },
              { title: "Tailwind CSS", description: "إطار عمل CSS قائم على الفئات للتصميم السريع" },
              { title: "Shadcn UI", description: "مكتبة مكونات UI عالية الجودة قابلة للتخصيص" },
              { title: "React Query", description: "مكتبة لإدارة حالة البيانات وطلبات الشبكة" }
            ]}
          />

          <DocumentationSection
            title="هيكل التطبيق"
            content={[
              { title: "المكونات (Components)", description: "مكونات React القابلة لإعادة الاستخدام المنظمة حسب الوظيفة" },
              { title: "الصفحات (Pages)", description: "صفحات التطبيق التي تجمع المكونات معًا" },
              { title: "الأدوات (Hooks)", description: "أدوات React المخصصة للمنطق المشترك والتفاعل مع API" },
              { title: "المسارات (Routes)", description: "تكوين التوجيه باستخدام React Router" },
              { title: "مخازن الحالة (Stores)", description: "إدارة حالة التطبيق باستخدام Zustand" }
            ]}
          />

          <DocumentationSection
            title="إدارة الحالة"
            content={[
              { title: "Zustand", description: "مكتبة بسيطة لإدارة الحالة مع واجهة برمجية مبسطة" },
              { title: "React Query", description: "إدارة حالة بيانات الخادم مع التخزين المؤقت وإعادة المحاولة" },
              { title: "مخازن محلية", description: "مخازن محلية لإدارة حالة التطبيق بأكمله" },
              { title: "Context API", description: "استخدام Context API في نطاقات أصغر" }
            ]}
          />

          <DocumentationSection
            title="أمان التطبيق"
            content={[
              { title: "المصادقة", description: "مصادقة المستخدم باستخدام Supabase Auth" },
              { title: "إدارة الأدوار", description: "نظام أدوار قائم على الأذونات للتحكم في الوصول" },
              { title: "قواعد RLS", description: "قواعد أمان على مستوى الصف في قاعدة البيانات" },
              { title: "التحقق من الصلاحيات", description: "التحقق المزدوج من الصلاحيات على جانب العميل والخادم" }
            ]}
          />

          <DocumentationSection
            title="تكامل API"
            content={[
              { title: "Supabase Client", description: "استخدام عميل Supabase للتفاعل مع قاعدة البيانات" },
              { title: "React Query", description: "إدارة طلبات API والتخزين المؤقت" },
              { title: "API الخارجية", description: "التكامل مع API الخارجية (مثل WhatsApp، والدفع، إلخ)" }
            ]}
          />
          
          <DocumentationSection
            title="نماذج كود"
            content={[
              { 
                title: "استخدام Supabase", 
                description: <CodeBlock 
                  code={`import { supabase } from '@/integrations/supabase/client';

// استعلام بسيط
const fetchEvents = async () => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data;
};

// إدخال بيانات
const createEvent = async (eventData) => {
  const { data, error } = await supabase
    .from('events')
    .insert(eventData)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};`}
                  language="typescript"
                />
              },
              { 
                title: "استخدام React Query", 
                description: <CodeBlock 
                  code={`import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// استخدام useQuery لجلب البيانات
const useEvents = () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents
  });
};

// استخدام useMutation لتعديل البيانات
const useCreateEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      // إعادة تحديث البيانات بعد الإضافة
      queryClient.invalidateQueries({ queryKey: ['events'] });
    }
  });
};`}
                  language="typescript"
                />
              },
              { 
                title: "التحقق من الصلاحيات", 
                description: <CodeBlock 
                  code={`import { useAuthStore } from '@/store/authStore';
import { usePermissions } from '@/hooks/usePermissions';

// مكون مع التحقق من الصلاحيات
const ProtectedComponent = () => {
  const { user } = useAuthStore();
  const { hasPermission } = usePermissions();
  
  // التحقق من وجود صلاحية معينة
  if (!hasPermission('events.create')) {
    return <p>ليس لديك صلاحية للوصول إلى هذه الصفحة</p>;
  }
  
  return (
    <div>
      {/* محتوى المكون */}
    </div>
  );
};`}
                  language="tsx"
                />
              }
            ]}
          />
        </Accordion>
      </CardContent>
    </Card>
  );
};
