
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UIFeatureCard } from "../components/UIFeatureCard";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CodeBlock } from "../components/CodeBlock";

export const UIDocumentation = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>توثيق واجهة المستخدم</CardTitle>
          <CardDescription>
            شرح تفصيلي لواجهات المستخدم والصفحات الرئيسية وتدفق المستخدم
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pages">
            <TabsList className="mb-4">
              <TabsTrigger value="pages">الصفحات</TabsTrigger>
              <TabsTrigger value="components">المكونات المشتركة</TabsTrigger>
              <TabsTrigger value="design">نظام التصميم</TabsTrigger>
              <TabsTrigger value="technical">التفاصيل التقنية</TabsTrigger>
            </TabsList>
            
            <TabsContent value="pages" className="space-y-6">
              <h3 className="text-lg font-semibold mb-4">الصفحات الرئيسية</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <UIFeatureCard
                  title="الصفحة الرئيسية"
                  description="تعرض الفعاليات والمشاريع القادمة، والبانر التعريفي، والإحصائيات العامة."
                  features={[
                    "عرض الفعاليات القادمة",
                    "عرض المشاريع النشطة",
                    "شريط البحث السريع",
                    "البانر الإعلاني",
                  ]}
                />
                
                <UIFeatureCard
                  title="صفحة الفعاليات"
                  description="تعرض قائمة الفعاليات المتاحة مع إمكانية التصفية والبحث."
                  features={[
                    "بطاقات الفعاليات",
                    "التصنيف حسب النوع والتاريخ",
                    "البحث والتصفية",
                    "التسجيل المباشر",
                  ]}
                />
                
                <UIFeatureCard
                  title="صفحة المشاريع"
                  description="تعرض المشاريع المتاحة مع أنشطتها والمعلومات الأساسية."
                  features={[
                    "بطاقات المشاريع",
                    "تفاصيل الأنشطة",
                    "متطلبات المشاركة",
                    "نسب الإنجاز",
                  ]}
                />
                
                <UIFeatureCard
                  title="صفحة المهام"
                  description="واجهة إدارة المهام ومتابعة الإنجاز وتبادل التعليقات."
                  features={[
                    "قائمة المهام المسندة",
                    "تغيير حالة المهام",
                    "إضافة التعليقات والمرفقات",
                    "متابعة المهام الفرعية",
                  ]}
                />
                
                <UIFeatureCard
                  title="صفحة الأفكار"
                  description="منصة لمشاركة وتقييم الأفكار والمبادرات الجديدة."
                  features={[
                    "عرض الأفكار المقترحة",
                    "التصويت على الأفكار",
                    "إضافة تعليقات وملاحظات",
                    "تحديثات الأفكار ومراحل التنفيذ",
                  ]}
                />
                
                <UIFeatureCard
                  title="صفحة المستندات"
                  description="إدارة وأرشفة المستندات والوثائق المهمة."
                  features={[
                    "تصنيف المستندات",
                    "البحث في المستندات",
                    "تنبيهات انتهاء الصلاحية",
                    "إدارة الإصدارات",
                  ]}
                />
                
                <UIFeatureCard
                  title="صفحة الطلبات"
                  description="نظام الطلبات الإلكترونية ومتابعة سير العمل."
                  features={[
                    "تقديم طلبات جديدة",
                    "متابعة حالة الطلبات",
                    "سير عمل الموافقات",
                    "إشعارات تحديثات الطلبات",
                  ]}
                />
                
                <UIFeatureCard
                  title="صفحة الإحصائيات"
                  description="لوحات ومؤشرات الأداء الرئيسية والتقارير."
                  features={[
                    "إحصائيات الحضور والمشاركة",
                    "مؤشرات الأداء المالي",
                    "تقارير الإنجاز",
                    "رسوم بيانية تفاعلية",
                  ]}
                />
                
                <UIFeatureCard
                  title="صفحة المحفظة"
                  description="إدارة الموارد المالية والميزانيات والمصروفات."
                  features={[
                    "عرض الموارد المالية المتاحة",
                    "متابعة المصروفات",
                    "تقارير مالية دورية",
                    "مقارنة المخطط بالفعلي",
                  ]}
                />
                
                <UIFeatureCard
                  title="صفحة الاشتراكات"
                  description="إدارة الاشتراكات والعضويات والتجديدات."
                  features={[
                    "تفاصيل الاشتراكات الحالية",
                    "تنبيهات التجديد",
                    "خيارات الدفع",
                    "سجل الاشتراكات السابقة",
                  ]}
                />
                
                <UIFeatureCard
                  title="صفحة الشهادات"
                  description="إصدار وإدارة والتحقق من الشهادات الإلكترونية."
                  features={[
                    "إنشاء قوالب الشهادات",
                    "إصدار شهادات للمشاركين",
                    "التحقق من صحة الشهادات",
                    "إدارة التوقيعات الإلكترونية",
                  ]}
                />
                
                <UIFeatureCard
                  title="لوحة التحكم"
                  description="لوحة تحكم المسؤول لإدارة الفعاليات والمشاريع والمستخدمين."
                  features={[
                    "إدارة المستخدمين",
                    "متابعة التسجيلات",
                    "مؤشرات الأداء",
                    "التقارير والإحصائيات",
                  ]}
                />
                
                <UIFeatureCard
                  title="صفحة الإعدادات"
                  description="صفحة إدارة إعدادات النظام والإشعارات والشهادات."
                  features={[
                    "إعدادات الواتساب",
                    "قوالب الرسائل",
                    "إدارة التوقيعات",
                    "قوالب الشهادات",
                  ]}
                />
                
                <UIFeatureCard
                  title="صفحة الملف الشخصي"
                  description="عرض وتعديل معلومات المستخدم الشخصية وتفضيلاته."
                  features={[
                    "تعديل المعلومات الشخصية",
                    "تفضيلات الإشعارات",
                    "سجل الأنشطة",
                    "الإنجازات والشهادات",
                  ]}
                />
                
                <UIFeatureCard
                  title="صفحة التوثيق"
                  description="توثيق النظام ودليل المستخدم والمطور."
                  features={[
                    "دليل استخدام النظام",
                    "توثيق واجهات البرمجة",
                    "شرح المكونات",
                    "أمثلة توضيحية",
                  ]}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="components" className="space-y-6">
              <h3 className="text-lg font-semibold mb-4">المكونات المشتركة</h3>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="forms">
                  <AccordionTrigger>النماذج ومكونات الإدخال</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div className="border-r-2 border-primary pr-4 py-2">
                      <h4 className="font-medium">حقول الإدخال الأساسية</h4>
                      <p className="text-muted-foreground text-sm mt-1">
                        مجموعة من حقول الإدخال المُعاد استخدامها في كافة أنحاء التطبيق. تشمل حقول النصوص، الأرقام، التواريخ، والاختيارات.
                      </p>
                      
                      <CodeBlock 
                        code={`<Input placeholder="أدخل عنوان الفعالية" {...field} />`} 
                        language="typescript" 
                      />
                    </div>
                    
                    <div className="border-r-2 border-primary pr-4 py-2">
                      <h4 className="font-medium">نماذج التسجيل</h4>
                      <p className="text-muted-foreground text-sm mt-1">
                        نماذج قابلة للتخصيص لتسجيل المستخدمين في الفعاليات والمشاريع. تدعم التحقق وحفظ البيانات المؤقت.
                      </p>
                    </div>
                    
                    <div className="border-r-2 border-primary pr-4 py-2">
                      <h4 className="font-medium">الاستمارات القابلة للتخصيص</h4>
                      <p className="text-muted-foreground text-sm mt-1">
                        مكون لبناء استمارات ديناميكية بحقول مخصصة. يستخدم في الطلبات وتسجيلات الفعاليات.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="cards">
                  <AccordionTrigger>البطاقات</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div className="border-r-2 border-primary pr-4 py-2">
                      <h4 className="font-medium">بطاقات الفعاليات</h4>
                      <p className="text-muted-foreground text-sm mt-1">
                        تعرض معلومات الفعالية بتصميم جذاب مع شارات الحالة والنوع وزر التسجيل.
                      </p>
                    </div>
                    
                    <div className="border-r-2 border-primary pr-4 py-2">
                      <h4 className="font-medium">بطاقات المشاريع</h4>
                      <p className="text-muted-foreground text-sm mt-1">
                        تعرض معلومات المشاريع مع مؤشر التقدم والأهداف والفعاليات المرتبطة.
                      </p>
                    </div>
                    
                    <div className="border-r-2 border-primary pr-4 py-2">
                      <h4 className="font-medium">بطاقات الإحصائيات</h4>
                      <p className="text-muted-foreground text-sm mt-1">
                        تعرض مؤشرات الأداء الرئيسية والإحصائيات مع رسوم بيانية صغيرة.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="tables">
                  <AccordionTrigger>الجداول والقوائم</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div className="border-r-2 border-primary pr-4 py-2">
                      <h4 className="font-medium">جداول البيانات</h4>
                      <p className="text-muted-foreground text-sm mt-1">
                        جداول متقدمة لعرض البيانات مع دعم للفرز والتصفية والصفحات.
                      </p>
                      
                      <CodeBlock 
                        code={`<Table>
  <TableHeader>
    <TableRow>
      <TableHead>العنوان</TableHead>
      <TableHead>النوع</TableHead>
      <TableHead>التاريخ</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {items.map(item => (
      <TableRow key={item.id}>
        <TableCell>{item.title}</TableCell>
        <TableCell>{item.type}</TableCell>
        <TableCell>{formatDate(item.date)}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>`} 
                        language="typescript" 
                      />
                    </div>
                    
                    <div className="border-r-2 border-primary pr-4 py-2">
                      <h4 className="font-medium">قوائم المهام</h4>
                      <p className="text-muted-foreground text-sm mt-1">
                        قوائم تفاعلية للمهام مع تحديث الحالة وعرض التفاصيل والإجراءات.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="alerts">
                  <AccordionTrigger>الإشعارات والتنبيهات</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div className="border-r-2 border-primary pr-4 py-2">
                      <h4 className="font-medium">رسائل التنبيه</h4>
                      <p className="text-muted-foreground text-sm mt-1">
                        رسائل تنبيه بأنواع مختلفة (نجاح، خطأ، تحذير، معلومات) تظهر للمستخدم.
                      </p>
                    </div>
                    
                    <div className="border-r-2 border-primary pr-4 py-2">
                      <h4 className="font-medium">نوافذ التأكيد</h4>
                      <p className="text-muted-foreground text-sm mt-1">
                        مربعات حوار للتأكيد قبل إجراء عمليات مهمة مثل الحذف.
                      </p>
                    </div>
                    
                    <div className="border-r-2 border-primary pr-4 py-2">
                      <h4 className="font-medium">الإشعارات المنبثقة</h4>
                      <p className="text-muted-foreground text-sm mt-1">
                        إشعارات منبثقة (toast) تظهر مؤقتاً لإعلام المستخدم بنتائج العمليات.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="buttons">
                  <AccordionTrigger>الأزرار والإجراءات</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div className="border-r-2 border-primary pr-4 py-2">
                      <h4 className="font-medium">أزرار الإجراءات</h4>
                      <p className="text-muted-foreground text-sm mt-1">
                        مجموعة متنوعة من الأزرار بتصميمات وأحجام مختلفة للإجراءات المختلفة.
                      </p>
                      
                      <CodeBlock 
                        code={`<Button variant="default">إضافة جديد</Button>
<Button variant="destructive">حذف</Button>
<Button variant="outline">إلغاء</Button>
<Button variant="ghost">تفاصيل</Button>`} 
                        language="typescript" 
                      />
                    </div>
                    
                    <div className="border-r-2 border-primary pr-4 py-2">
                      <h4 className="font-medium">أزرار المشاركة</h4>
                      <p className="text-muted-foreground text-sm mt-1">
                        أزرار لمشاركة المحتوى عبر وسائل التواصل المختلفة وتطبيق الواتساب.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="loader">
                  <AccordionTrigger>مؤشرات التحميل</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div className="border-r-2 border-primary pr-4 py-2">
                      <h4 className="font-medium">مؤشرات دائرية</h4>
                      <p className="text-muted-foreground text-sm mt-1">
                        مؤشرات تحميل دائرية بأحجام مختلفة تظهر أثناء تحميل البيانات.
                      </p>
                    </div>
                    
                    <div className="border-r-2 border-primary pr-4 py-2">
                      <h4 className="font-medium">مؤشرات خطية</h4>
                      <p className="text-muted-foreground text-sm mt-1">
                        شريط تقدم أفقي يظهر أثناء تحميل الصفحات الكاملة.
                      </p>
                    </div>
                    
                    <div className="border-r-2 border-primary pr-4 py-2">
                      <h4 className="font-medium">هياكل التحميل</h4>
                      <p className="text-muted-foreground text-sm mt-1">
                        هياكل عظمية (skeletons) تظهر أثناء تحميل المحتوى الرئيسي.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="uploads">
                  <AccordionTrigger>رفع الملفات</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div className="border-r-2 border-primary pr-4 py-2">
                      <h4 className="font-medium">منطقة سحب وإفلات الملفات</h4>
                      <p className="text-muted-foreground text-sm mt-1">
                        واجهة لرفع الملفات من خلال السحب والإفلات أو اختيار الملفات.
                      </p>
                    </div>
                    
                    <div className="border-r-2 border-primary pr-4 py-2">
                      <h4 className="font-medium">عارض صور المرفقات</h4>
                      <p className="text-muted-foreground text-sm mt-1">
                        عرض الصور المرفوعة مع خيارات التعديل والحذف.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="reports">
                  <AccordionTrigger>التقارير والتصدير</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div className="border-r-2 border-primary pr-4 py-2">
                      <h4 className="font-medium">نماذج التقارير</h4>
                      <p className="text-muted-foreground text-sm mt-1">
                        نماذج لإنشاء تقارير الفعاليات والمشاريع والمهام.
                      </p>
                    </div>
                    
                    <div className="border-r-2 border-primary pr-4 py-2">
                      <h4 className="font-medium">أدوات التصدير</h4>
                      <p className="text-muted-foreground text-sm mt-1">
                        أزرار لتصدير البيانات بتنسيقات مختلفة (PDF، Excel).
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </TabsContent>
            
            <TabsContent value="design" className="space-y-6">
              <h3 className="text-lg font-semibold mb-4">نظام التصميم</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">الألوان الرئيسية</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-primary rounded-md"></div>
                        <div>
                          <div className="font-medium">الأساسي</div>
                          <div className="text-xs text-muted-foreground">Primary</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-secondary rounded-md"></div>
                        <div>
                          <div className="font-medium">الثانوي</div>
                          <div className="text-xs text-muted-foreground">Secondary</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-accent rounded-md"></div>
                        <div>
                          <div className="font-medium">التمييز</div>
                          <div className="text-xs text-muted-foreground">Accent</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-destructive rounded-md"></div>
                        <div>
                          <div className="font-medium">التحذير</div>
                          <div className="text-xs text-muted-foreground">Destructive</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">الطباعة</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <div className="text-2xl font-bold">عنوان رئيسي</div>
                        <div className="text-xs text-muted-foreground">h1 - 2xl - bold</div>
                      </div>
                      <div>
                        <div className="text-xl font-semibold">عنوان ثانوي</div>
                        <div className="text-xs text-muted-foreground">h2 - xl - semibold</div>
                      </div>
                      <div>
                        <div className="text-lg font-medium">عنوان فرعي</div>
                        <div className="text-xs text-muted-foreground">h3 - lg - medium</div>
                      </div>
                      <div>
                        <div className="text-base">نص عادي</div>
                        <div className="text-xs text-muted-foreground">p - base - normal</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">نص ثانوي</div>
                        <div className="text-xs text-muted-foreground">small - sm - normal</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">التباعدات (Spacing)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gray-200 rounded-sm"></div>
                        <div className="text-sm">تباعد صغير (1rem - 16px)</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gray-200 rounded-sm"></div>
                        <div className="text-sm">تباعد متوسط (1.5rem - 24px)</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-200 rounded-sm"></div>
                        <div className="text-sm">تباعد كبير (2rem - 32px)</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-12 bg-gray-200 rounded-sm"></div>
                        <div className="text-sm">تباعد أكبر (3rem - 48px)</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">التصميم المتجاوب</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="font-medium">نقاط التحول (Breakpoints)</div>
                        <ul className="text-sm mt-1 space-y-1">
                          <li><span className="font-mono">sm:</span> 640px - للأجهزة المحمولة</li>
                          <li><span className="font-mono">md:</span> 768px - للأجهزة اللوحية</li>
                          <li><span className="font-mono">lg:</span> 1024px - للشاشات الصغيرة</li>
                          <li><span className="font-mono">xl:</span> 1280px - للشاشات المتوسطة</li>
                          <li><span className="font-mono">2xl:</span> 1536px - للشاشات الكبيرة</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="technical" className="space-y-6">
              <h3 className="text-lg font-semibold mb-4">التفاصيل التقنية</h3>
              
              <div className="border rounded-lg p-6 bg-card">
                <h4 className="font-semibold mb-4">هيكل المكونات وأفضل الممارسات</h4>
                
                <div className="space-y-6">
                  <div>
                    <h5 className="font-medium mb-2">هيكل المجلدات</h5>
                    <CodeBlock 
                      code={`src/
├── components/           # المكونات المشتركة
│   ├── ui/               # مكونات واجهة المستخدم الأساسية
│   ├── events/           # مكونات خاصة بالفعاليات
│   ├── projects/         # مكونات خاصة بالمشاريع
│   └── ...
├── hooks/                # خطافات React المخصصة
├── lib/                  # وظائف مساعدة ومكتبات
├── pages/                # صفحات التطبيق
├── store/                # إدارة الحالة العامة
└── types/                # تعريفات TypeScript`} 
                      language="plaintext" 
                    />
                  </div>
                  
                  <div>
                    <h5 className="font-medium mb-2">تنظيم المكونات</h5>
                    <p className="text-sm text-muted-foreground mb-2">
                      يتم تنظيم المكونات بحسب الوظيفة والمجال. المكونات المشتركة تُخزن في مجلد <code>components/ui</code>، 
                      بينما المكونات الخاصة بمجال معين تُخزن في مجلدات منفصلة.
                    </p>
                    
                    <CodeBlock 
                      code={`// مثال على مكون Card من shadcn/ui
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const StatisticsCard = ({ title, value, icon }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
};`} 
                      language="typescript" 
                    />
                  </div>
                  
                  <div>
                    <h5 className="font-medium mb-2">استخدام الخطافات (Hooks)</h5>
                    <p className="text-sm text-muted-foreground mb-2">
                      نستخدم خطافات React المخصصة لعزل المنطق وتحسين قابلية إعادة الاستخدام.
                    </p>
                    
                    <CodeBlock 
                      code={`// مثال على استخدام خطاف مخصص
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useEventsQuery = (filters = {}) => {
  return useQuery({
    queryKey: ["events", filters],
    queryFn: async () => {
      const query = supabase.from("events").select("*");
      
      // تطبيق الفلاتر
      if (filters.type) {
        query.eq("event_type", filters.type);
      }
      
      if (filters.date) {
        query.gte("event_date", filters.date);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    }
  });
};`} 
                      language="typescript" 
                    />
                  </div>
                  
                  <div>
                    <h5 className="font-medium mb-2">التحقق من المدخلات</h5>
                    <p className="text-sm text-muted-foreground mb-2">
                      نستخدم مكتبة Zod للتحقق من المدخلات وتعريف الأنواع.
                    </p>
                    
                    <CodeBlock 
                      code={`import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// تعريف مخطط التحقق
const formSchema = z.object({
  title: z.string().min(3, "العنوان قصير جدًا").max(100),
  description: z.string().min(10, "الوصف قصير جدًا"),
  date: z.string().min(1, "التاريخ مطلوب"),
  type: z.string().min(1, "النوع مطلوب"),
  seats: z.number().min(1, "عدد المقاعد مطلوب"),
});

// استخدامه مع React Hook Form
const form = useForm({
  resolver: zodResolver(formSchema),
  defaultValues: {
    title: "",
    description: "",
    date: "",
    type: "",
    seats: 1,
  },
});`} 
                      language="typescript" 
                    />
                  </div>
                  
                  <div>
                    <h5 className="font-medium mb-2">إدارة الحالة العامة</h5>
                    <p className="text-sm text-muted-foreground mb-2">
                      نستخدم Zustand لإدارة الحالة العامة في التطبيق.
                    </p>
                    
                    <CodeBlock 
                      code={`import { create } from "zustand";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,
  setUser: (user) => set({ user, isAuthenticated: !!user, loading: false }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));`} 
                      language="typescript" 
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
