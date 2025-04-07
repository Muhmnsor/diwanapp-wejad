
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DocumentationSection } from "../components/DocumentationSection";
import { Accordion } from "@/components/ui/accordion";
import { CodeBlock } from "../components/CodeBlock";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const TechnicalDocumentation = () => {
  const authHookCode = `
// استخدام الهوك للتحقق من المستخدم والصلاحيات
const { user, isAuthenticated, permissions } = useAuthStore();

// التحقق من وجود صلاحية معينة
const canCreateEvents = permissions.includes('events_create');

// التحقق من الدخول للنظام
if (!isAuthenticated) {
  return <Navigate to="/login" />;
}
`;

  const tanstackQueryCode = `
// استخدام useQuery للحصول على البيانات
const { data, isLoading, error } = useQuery({
  queryKey: ['events'],
  queryFn: fetchEvents
});

// استخدام useMutation لإضافة بيانات جديدة
const mutation = useMutation({
  mutationFn: createEvent,
  onSuccess: () => {
    toast.success('تم إنشاء الفعالية بنجاح');
    queryClient.invalidateQueries({ queryKey: ['events'] });
  }
});

// تنفيذ العملية
mutation.mutate(newEventData);
`;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>التوثيق التقني</CardTitle>
          <CardDescription>
            الجوانب التقنية للنظام، البنية، والتقنيات المستخدمة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="stack">
            <TabsList className="mb-4">
              <TabsTrigger value="stack">التقنيات المستخدمة</TabsTrigger>
              <TabsTrigger value="auth">المصادقة والتفويض</TabsTrigger>
              <TabsTrigger value="state">إدارة الحالة</TabsTrigger>
              <TabsTrigger value="api">التعامل مع API</TabsTrigger>
              <TabsTrigger value="deployment">النشر والتشغيل</TabsTrigger>
            </TabsList>

            <TabsContent value="stack">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">نظرة عامة على البنية التقنية</h3>
                  <p className="mb-4">
                    تم بناء النظام باستخدام تقنيات حديثة ومتطورة لضمان الأداء والموثوقية وقابلية الصيانة.
                  </p>
                  
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>العنصر</TableHead>
                        <TableHead>التقنية</TableHead>
                        <TableHead>الوصف</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-semibold">واجهة المستخدم</TableCell>
                        <TableCell>React + TypeScript</TableCell>
                        <TableCell>إطار عمل JavaScript متكامل لبناء واجهات المستخدم</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">تنسيق العناصر</TableCell>
                        <TableCell>Tailwind CSS + shadcn/ui</TableCell>
                        <TableCell>إطار عمل CSS متقدم مع مكونات واجهة مستخدم متوافقة</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">إدارة الحالة</TableCell>
                        <TableCell>Zustand</TableCell>
                        <TableCell>مكتبة خفيفة وسهلة الاستخدام لإدارة حالة التطبيق</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">التنقل</TableCell>
                        <TableCell>React Router</TableCell>
                        <TableCell>إدارة التنقل والمسارات داخل التطبيق</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">جلب البيانات</TableCell>
                        <TableCell>TanStack Query</TableCell>
                        <TableCell>إدارة حالة الاستعلامات والذاكرة المؤقتة وإعادة الجلب</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">قاعدة البيانات</TableCell>
                        <TableCell>Supabase (PostgreSQL)</TableCell>
                        <TableCell>منصة قاعدة بيانات مفتوحة المصدر ونظام تخزين مع API</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">المصادقة</TableCell>
                        <TableCell>Supabase Auth</TableCell>
                        <TableCell>نظام مصادقة متكامل يدعم البريد الإلكتروني وكلمة المرور والمزود الخارجي</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">الرسوم البيانية</TableCell>
                        <TableCell>Recharts</TableCell>
                        <TableCell>مكتبة مخططات بيانية متكاملة مع React</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">رمزيات وأيقونات</TableCell>
                        <TableCell>Lucide React</TableCell>
                        <TableCell>مجموعة أيقونات متوافقة مع React</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">التحقق من البيانات</TableCell>
                        <TableCell>Zod + React Hook Form</TableCell>
                        <TableCell>مكتبات للتحقق من صحة النماذج والبيانات</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">إشعارات واجهة المستخدم</TableCell>
                        <TableCell>Sonner</TableCell>
                        <TableCell>نظام إشعارات متقدم لواجهة المستخدم</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">بنية المشروع</h3>
                  <div className="rounded-md bg-muted p-4 overflow-auto">
                    <pre className="text-xs">
{`src/
├── components/        # مكونات واجهة المستخدم المشتركة
│   ├── ui/            # المكونات الأساسية من shadcn/ui
│   ├── admin/         # مكونات لوحة التحكم
│   ├── events/        # مكونات نظام الفعاليات
│   ├── hr/            # مكونات نظام الموارد البشرية
│   ├── ...
├── hooks/             # Custom React hooks
│   ├── use-auth.ts
│   ├── use-form.ts
│   ├── ...
├── lib/               # مكتبات وأدوات مساعدة
│   ├── utils.ts       # دوال مساعدة عامة
│   ├── ...
├── pages/             # صفحات التطبيق
│   ├── Dashboard.tsx
│   ├── EventDetails.tsx
│   ├── ...
├── routes/            # تعريفات المسارات ومجموعات المسارات
├── store/             # مخازن إدارة الحالة (Zustand)
├── types/             # تعريفات الأنواع (TypeScript)
├── integrations/      # تكاملات مع خدمات خارجية
│   ├── supabase/
│   ├── ...
└── App.tsx            # مكون التطبيق الرئيسي`}
                    </pre>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="auth">
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-2">نظام المصادقة والتفويض</h3>
                  <p>
                    يستخدم النظام Supabase Auth للمصادقة مع تكامل متقدم مع نظام الصلاحيات الداخلي.
                    يتم التحقق من صلاحيات المستخدمين على مستويين:
                  </p>
                  <ul className="list-disc ml-6 mt-2 space-y-1">
                    <li>مستوى قاعدة البيانات (Row Level Security)</li>
                    <li>مستوى واجهة المستخدم (UI Permission Checks)</li>
                  </ul>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-6">
                    <h4 className="font-semibold mb-2">بنية نظام الصلاحيات</h4>
                    <ul className="list-disc ml-6 space-y-1 text-sm">
                      <li><strong>الأدوار (Roles)</strong> - مجموعات من الصلاحيات</li>
                      <li><strong>الصلاحيات (Permissions)</strong> - إمكانيات محددة في النظام</li>
                      <li><strong>صلاحيات التطبيقات (App Permissions)</strong> - الوصول إلى تطبيقات معينة</li>
                    </ul>
                  </Card>

                  <Card className="p-6">
                    <h4 className="font-semibold mb-2">أنواع الأدوار الرئيسية</h4>
                    <ul className="list-disc ml-6 space-y-1 text-sm">
                      <li><strong>admin</strong> - وصول كامل إلى جميع أجزاء النظام</li>
                      <li><strong>app_admin</strong> - إدارة التطبيق دون الوصول إلى الميزات التقنية</li>
                      <li><strong>developer</strong> - وصول إلى أدوات التطوير والإعدادات المتقدمة</li>
                      <li><strong>hr_manager</strong> - إدارة نظام الموارد البشرية</li>
                      <li><strong>events_manager</strong> - إدارة الفعاليات والبرامج</li>
                      <li><strong>financial_manager</strong> - إدارة الموارد المالية والمحاسبة</li>
                    </ul>
                  </Card>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">استخدام هوك المصادقة</h3>
                  <CodeBlock code={authHookCode} />
                  
                  <h4 className="font-semibold mt-6 mb-2">سير عملية المصادقة</h4>
                  <ol className="list-decimal ml-6 space-y-1">
                    <li>المستخدم يدخل البريد الإلكتروني وكلمة المرور</li>
                    <li>استدعاء API مصادقة Supabase</li>
                    <li>إنشاء جلسة واسترجاع معلومات المستخدم</li>
                    <li>استرجاع أدوار وصلاحيات المستخدم من قاعدة البيانات</li>
                    <li>تخزين بيانات المستخدم والصلاحيات في مخزن Zustand</li>
                  </ol>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="state">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">إدارة حالة التطبيق</h3>
                  <p className="mb-4">
                    يستخدم النظام مزيجًا من التقنيات لإدارة حالة التطبيق بشكل فعال:
                  </p>
                  
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>التقنية</TableHead>
                        <TableHead>الاستخدام</TableHead>
                        <TableHead>المثال</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-semibold">Zustand</TableCell>
                        <TableCell>
                          <ul className="list-disc ml-6 text-sm">
                            <li>حالة المصادقة العامة</li>
                            <li>إعدادات المستخدم</li>
                            <li>تفضيلات واجهة المستخدم</li>
                          </ul>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          useAuthStore, useSettingsStore
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">TanStack Query</TableCell>
                        <TableCell>
                          <ul className="list-disc ml-6 text-sm">
                            <li>إدارة حالة البيانات من API</li>
                            <li>التخزين المؤقت والإلغاء التلقائي</li>
                            <li>إعادة المحاولة والمزامنة</li>
                          </ul>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          useQuery, useMutation
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">React Context</TableCell>
                        <TableCell>
                          <ul className="list-disc ml-6 text-sm">
                            <li>مشاركة البيانات بين المكونات ذات الصلة</li>
                            <li>إدارة حالة صفحة متكاملة</li>
                          </ul>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          ThemeContext, DashboardContext
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">Local Component State</TableCell>
                        <TableCell>
                          <ul className="list-disc ml-6 text-sm">
                            <li>حالة المكونات المؤقتة</li>
                            <li>حالة النماذج والإدخال</li>
                          </ul>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          useState, useReducer
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">localStorage / sessionStorage</TableCell>
                        <TableCell>
                          <ul className="list-disc ml-6 text-sm">
                            <li>تفضيلات المستخدم المستمرة</li>
                            <li>بيانات التوثيق المؤقتة</li>
                          </ul>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          useLocalStorage
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">استراتيجية إدارة الحالة</h3>
                  
                  <Accordion type="multiple" className="w-full">
                    <DocumentationSection 
                      title="استخدام Zustand للحالة العامة" 
                      content={[
                        {
                          title: "useAuthStore",
                          description: "حالة المصادقة الرئيسية وبيانات المستخدم والصلاحيات"
                        },
                        {
                          title: "useSettingsStore",
                          description: "إعدادات المستخدم وتفضيلات النظام"
                        },
                        {
                          title: "useNotificationStore",
                          description: "إدارة الإشعارات العامة في التطبيق"
                        }
                      ]}
                    />

                    <DocumentationSection 
                      title="استخدام TanStack Query لإدارة البيانات" 
                      content={[
                        {
                          title: "البيانات المشتركة",
                          description: "البيانات المطلوبة في عدة مكونات (قوائم الفعاليات، المستخدمين، إلخ)"
                        },
                        {
                          title: "البيانات المتغيرة",
                          description: "البيانات التي تتغير من خلال التفاعل مع المستخدم"
                        },
                        {
                          title: "البيانات التي تتطلب مزامنة",
                          description: "البيانات التي يمكن تعديلها من قبل مستخدمين آخرين"
                        }
                      ]}
                    />

                    <DocumentationSection 
                      title="استخدام React Context" 
                      content={[
                        {
                          title: "قيود الاستخدام",
                          description: "فقط للبيانات المشتركة بين مكونات ذات صلة في نفس فرع شجرة المكونات"
                        },
                        {
                          title: "أمثلة",
                          description: "سياق النموذج (FormContext)، سياق لوحة التحكم (DashboardContext)"
                        }
                      ]}
                    />
                  </Accordion>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="api">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">التعامل مع واجهة البرمجة API</h3>
                  <p className="mb-4">
                    يستخدم النظام مكتبة TanStack Query (React Query) لإدارة عمليات جلب البيانات وتعديلها، مع استخدام Supabase Client كطبقة وصول للبيانات.
                  </p>

                  <CodeBlock code={tanstackQueryCode} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-6">
                    <h4 className="font-semibold mb-2">مميزات استخدام TanStack Query</h4>
                    <ul className="list-disc ml-6 space-y-1 text-sm">
                      <li>التخزين المؤقت التلقائي للنتائج</li>
                      <li>إلغاء صلاحية البيانات تلقائيًا عند التحديث</li>
                      <li>إعادة المحاولة التلقائية عند فشل الطلبات</li>
                      <li>تزامن الحالة عبر المكونات المختلفة</li>
                      <li>استرجاع البيانات عند استعادة اتصال الشبكة</li>
                      <li>حالة التحميل والخطأ والنجاح المُدارة تلقائيًا</li>
                    </ul>
                  </Card>

                  <Card className="p-6">
                    <h4 className="font-semibold mb-2">استراتيجية استخدام Supabase</h4>
                    <ul className="list-disc ml-6 space-y-1 text-sm">
                      <li>استخدام استعلامات PostgreSQL مباشرة للعمليات المعقدة</li>
                      <li>استخدام وظائف RPC للمنطق المعقد على جانب الخادم</li>
                      <li>استخدام Row Level Security (RLS) لضمان أمان البيانات</li>
                      <li>استخدام WebSockets للتحديثات في الوقت الفعلي</li>
                      <li>استخدام Supabase Storage لتخزين الملفات</li>
                    </ul>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>هيكل الهوكات المخصصة للبيانات</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>الهوك</TableHead>
                          <TableHead>الوظيفة</TableHead>
                          <TableHead>مثال على الاستخدام</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-mono text-xs">useEvents</TableCell>
                          <TableCell>جلب قائمة الفعاليات مع خيارات التصفية والفرز</TableCell>
                          <TableCell><code>const { data, isLoading } = useEvents({ category: 'social' })</code></TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-mono text-xs">useEvent</TableCell>
                          <TableCell>جلب تفاصيل فعالية محددة بمعرفها</TableCell>
                          <TableCell><code>const { data, isLoading } = useEvent(eventId)</code></TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-mono text-xs">useCreateEvent</TableCell>
                          <TableCell>إنشاء فعالية جديدة</TableCell>
                          <TableCell><code>const { mutate, isLoading } = useCreateEvent()</code></TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-mono text-xs">useUpdateEvent</TableCell>
                          <TableCell>تحديث بيانات فعالية موجودة</TableCell>
                          <TableCell><code>const { mutate } = useUpdateEvent()</code></TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-mono text-xs">useDeleteEvent</TableCell>
                          <TableCell>حذف فعالية</TableCell>
                          <TableCell><code>const { mutate } = useDeleteEvent()</code></TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-mono text-xs">useRegisterForEvent</TableCell>
                          <TableCell>تسجيل مشارك في فعالية</TableCell>
                          <TableCell><code>const { mutate } = useRegisterForEvent()</code></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="deployment">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>النشر والتشغيل</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">
                      يستخدم النظام استراتيجية نشر حديثة تعتمد على خدمات سحابية موثوقة وتقنيات CI/CD متطورة.
                    </p>
                    
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>الخدمة</TableHead>
                          <TableHead>الدور</TableHead>
                          <TableHead>الميزات الرئيسية</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-semibold">Vercel</TableCell>
                          <TableCell>استضافة تطبيق الواجهة الأمامية</TableCell>
                          <TableCell>
                            <ul className="list-disc ml-6 text-sm space-y-1">
                              <li>نشر تلقائي عند الدفع إلى GitHub</li>
                              <li>بيئات معاينة لكل طلب سحب</li>
                              <li>تنفيذ تطبيقات Edge/Serverless</li>
                            </ul>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-semibold">Supabase</TableCell>
                          <TableCell>قاعدة البيانات والمصادقة والتخزين</TableCell>
                          <TableCell>
                            <ul className="list-disc ml-6 text-sm space-y-1">
                              <li>قاعدة بيانات PostgreSQL المُدارة</li>
                              <li>نظام مصادقة متكامل</li>
                              <li>وظائف Edge لمنطق العمل الخلفي</li>
                              <li>نسخ احتياطي تلقائي</li>
                            </ul>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-semibold">GitHub Actions</TableCell>
                          <TableCell>سير عمل CI/CD</TableCell>
                          <TableCell>
                            <ul className="list-disc ml-6 text-sm space-y-1">
                              <li>اختبار تلقائي عند الدفع</li>
                              <li>تحليل الجودة والأمان</li>
                              <li>إنشاء وترقيم الإصدارات</li>
                            </ul>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <h3 className="font-semibold text-lg mb-2">عملية النشر</h3>
                    <ol className="list-decimal ml-6 space-y-2 text-sm">
                      <li>
                        <strong>التطوير المحلي</strong>
                        <p>يطور المطورون الميزات محليًا مع بيئات مستقلة</p>
                      </li>
                      <li>
                        <strong>دفع التغييرات</strong>
                        <p>دفع التغييرات إلى فرع الميزة وإنشاء طلب سحب</p>
                      </li>
                      <li>
                        <strong>بناء واختبار تلقائي</strong>
                        <p>GitHub Actions تبني وتختبر التطبيق تلقائيًا</p>
                      </li>
                      <li>
                        <strong>نشر بيئة المعاينة</strong>
                        <p>Vercel تنشئ بيئة معاينة لكل طلب سحب</p>
                      </li>
                      <li>
                        <strong>مراجعة واختبار يدوي</strong>
                        <p>فريق مراجعة الجودة يختبر الميزة في بيئة المعاينة</p>
                      </li>
                      <li>
                        <strong>دمج مع الفرع الرئيسي</strong>
                        <p>بعد الموافقة، يتم دمج التغييرات مع الفرع الرئيسي</p>
                      </li>
                      <li>
                        <strong>النشر التلقائي للإنتاج</strong>
                        <p>يتم نشر التطبيق تلقائيًا إلى بيئة الإنتاج</p>
                      </li>
                    </ol>
                  </Card>

                  <Card className="p-6">
                    <h3 className="font-semibold text-lg mb-2">استراتيجيات الأمان</h3>
                    <ul className="list-disc ml-6 space-y-2 text-sm">
                      <li>
                        <strong>أمان البيانات</strong>
                        <p>سياسات RLS على مستوى قاعدة البيانات تضمن عدم وصول المستخدمين إلى بيانات لا يملكون صلاحية الوصول إليها</p>
                      </li>
                      <li>
                        <strong>حماية API</strong>
                        <p>رموز JWT مع توقيع JWK وصلاحية قصيرة الأمد</p>
                      </li>
                      <li>
                        <strong>التشفير</strong>
                        <p>تشفير البيانات الحساسة في قاعدة البيانات وأثناء النقل عبر HTTPS</p>
                      </li>
                      <li>
                        <strong>مسح الملفات</strong>
                        <p>فحص الملفات المرفوعة للتأكد من سلامتها وخلوها من البرمجيات الخبيثة</p>
                      </li>
                      <li>
                        <strong>اختبار الاختراق</strong>
                        <p>اختبار دوري لاكتشاف وإصلاح الثغرات الأمنية المحتملة</p>
                      </li>
                      <li>
                        <strong>النسخ الاحتياطي</strong>
                        <p>نسخ احتياطية يومية لقاعدة البيانات مع استراتيجية استعادة مختبرة</p>
                      </li>
                    </ul>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
