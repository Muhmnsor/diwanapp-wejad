
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "../components/CodeBlock";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const TechnicalDocumentation = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>التوثيق التقني</CardTitle>
          <CardDescription>
            معلومات تقنية حول بنية النظام والتقنيات المستخدمة
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="tech-stack" className="w-full">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="tech-stack">التقنيات المستخدمة</TabsTrigger>
              <TabsTrigger value="architecture">هيكل المشروع</TabsTrigger>
              <TabsTrigger value="code-examples">أمثلة الأكواد</TabsTrigger>
              <TabsTrigger value="installation">متطلبات التثبيت</TabsTrigger>
            </TabsList>
            
            <TabsContent value="tech-stack">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>التقنية</TableHead>
                    <TableHead>الإصدار</TableHead>
                    <TableHead>الاستخدام</TableHead>
                    <TableHead>المسار</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>React</TableCell>
                    <TableCell>^18.3.1</TableCell>
                    <TableCell>مكتبة بناء واجهات المستخدم</TableCell>
                    <TableCell><code>src/App.tsx</code></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>TypeScript</TableCell>
                    <TableCell>^4.9.5</TableCell>
                    <TableCell>لغة البرمجة المستخدمة</TableCell>
                    <TableCell><code>src/types/</code></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Supabase</TableCell>
                    <TableCell>^2.47.2</TableCell>
                    <TableCell>قاعدة البيانات والمصادقة</TableCell>
                    <TableCell><code>src/integrations/supabase/</code></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Tailwind CSS</TableCell>
                    <TableCell>^3.3.3</TableCell>
                    <TableCell>إطار عمل التنسيق</TableCell>
                    <TableCell><code>tailwind.config.js</code></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>React Router</TableCell>
                    <TableCell>^6.26.2</TableCell>
                    <TableCell>إدارة التنقل</TableCell>
                    <TableCell><code>src/AppRoutes.tsx</code></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Lucide React</TableCell>
                    <TableCell>^0.462.0</TableCell>
                    <TableCell>مكتبة الأيقونات</TableCell>
                    <TableCell><code>import from 'lucide-react'</code></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>React Query</TableCell>
                    <TableCell>^5.56.2</TableCell>
                    <TableCell>إدارة حالات الطلبات</TableCell>
                    <TableCell><code>src/hooks/useQuery.tsx</code></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Sonner</TableCell>
                    <TableCell>^1.4.0</TableCell>
                    <TableCell>مكتبة الإشعارات</TableCell>
                    <TableCell><code>import from 'sonner'</code></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Recharts</TableCell>
                    <TableCell>^2.12.7</TableCell>
                    <TableCell>عرض الرسوم البيانية</TableCell>
                    <TableCell><code>src/components/charts/</code></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Zustand</TableCell>
                    <TableCell>^5.0.2</TableCell>
                    <TableCell>إدارة حالة التطبيق</TableCell>
                    <TableCell><code>src/store/</code></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TabsContent>
            
            <TabsContent value="architecture">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="structure">
                  <AccordionTrigger>هيكل الملفات</AccordionTrigger>
                  <AccordionContent>
                    <div className="border rounded-md p-3 mb-4">
                      <code className="text-sm">
                        <div><Badge variant="outline" className="mr-2">📁</Badge> src/</div>
                        <div className="mr-6"><Badge variant="outline" className="mr-2">📁</Badge> components/ - مكونات التطبيق المختلفة</div>
                        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> events/ - مكونات الفعاليات</div>
                        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> projects/ - مكونات المشاريع</div>
                        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> tasks/ - مكونات المهام</div>
                        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> layout/ - مكونات التخطيط العام</div>
                        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> ui/ - مكونات واجهة المستخدم الأساسية</div>
                        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> settings/ - مكونات الإعدادات</div>
                        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> documentation/ - مكونات التوثيق</div>
                        <div className="mr-6"><Badge variant="outline" className="mr-2">📁</Badge> pages/ - صفحات التطبيق</div>
                        <div className="mr-6"><Badge variant="outline" className="mr-2">📁</Badge> hooks/ - الدوال الخطافية</div>
                        <div className="mr-6"><Badge variant="outline" className="mr-2">📁</Badge> integrations/ - تكامل مع الخدمات الخارجية</div>
                        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> supabase/ - تكامل مع Supabase</div>
                        <div className="mr-6"><Badge variant="outline" className="mr-2">📁</Badge> store/ - مخازن حالة التطبيق</div>
                        <div className="mr-6"><Badge variant="outline" className="mr-2">📁</Badge> lib/ - مكتبات مساعدة</div>
                        <div className="mr-6"><Badge variant="outline" className="mr-2">📁</Badge> utils/ - دوال مساعدة</div>
                        <div className="mr-6"><Badge variant="outline" className="mr-2">📁</Badge> types/ - التعريفات النمطية</div>
                      </code>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="state-management">
                  <AccordionTrigger>إدارة الحالة</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm mb-2">يستخدم النظام Zustand لإدارة حالة التطبيق، وتوجد المخازن في المسار التالي:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm mb-4">
                      <li><code>src/store/developerStore.ts</code> - إدارة إعدادات المطورين</li>
                      <li><code>src/store/eventStore.ts</code> - إدارة بيانات الفعاليات</li>
                      <li><code>src/store/authStore.ts</code> - إدارة المصادقة والمستخدمين</li>
                      <li><code>src/store/refactored-auth.ts</code> - النسخة المحدثة من مخزن المصادقة</li>
                    </ul>
                    
                    <p className="text-sm mb-2">كيفية استخدام المخزن:</p>
                    <CodeBlock
                      code={`import { useDeveloperStore } from '@/store/developerStore';

// داخل المكون
const { settings, isLoading, fetchSettings } = useDeveloperStore();`}
                      language="typescript"
                    />
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="routing">
                  <AccordionTrigger>إدارة التنقل والمسارات</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm mb-2">يستخدم النظام React Router لإدارة التنقل، ويوجد تعريف المسارات في:</p>
                    <code className="block p-2 bg-muted rounded-md mb-4">src/AppRoutes.tsx</code>
                    
                    <p className="text-sm mb-2">مسارات النظام الرئيسية:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm mb-4">
                      <li><code>/</code> - الصفحة الرئيسية</li>
                      <li><code>/events</code> - صفحة الفعاليات</li>
                      <li><code>/events/:id</code> - تفاصيل الفعالية</li>
                      <li><code>/admin/developer-settings</code> - إعدادات المطورين</li>
                      <li><code>/admin/dashboard</code> - لوحة التحكم</li>
                    </ul>
                    
                    <p className="text-sm mb-2">كيفية استخدام التنقل البرمجي:</p>
                    <CodeBlock
                      code={`import { useNavigate } from 'react-router-dom';

// داخل المكون
const navigate = useNavigate();

// الانتقال إلى مسار
navigate('/events');

// الانتقال إلى الخلف
navigate(-1);`}
                      language="typescript"
                    />
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="database">
                  <AccordionTrigger>هيكل قاعدة البيانات</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm mb-2">يستخدم النظام Supabase كقاعدة بيانات، ويمكن الاطلاع على هيكل الجداول في:</p>
                    <code className="block p-2 bg-muted rounded-md mb-4">src/db/schema.sql</code>
                    
                    <p className="text-sm mb-2">الجداول الرئيسية:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm mb-4">
                      <li><code>events</code> - بيانات الفعاليات</li>
                      <li><code>registrations</code> - تسجيلات المشاركين</li>
                      <li><code>profiles</code> - ملفات المستخدمين</li>
                      <li><code>developer_settings</code> - إعدادات المطورين</li>
                      <li><code>projects</code> - بيانات المشاريع</li>
                      <li><code>tasks</code> - المهام</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </TabsContent>
            
            <TabsContent value="code-examples">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">مثال على استخدام Supabase</h3>
                  <CodeBlock
                    code={`import { supabase } from '@/integrations/supabase/client';

// جلب البيانات
const fetchEvents = async () => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching events:', error);
    return [];
  }
  
  return data || [];
};

// إضافة بيانات جديدة
const createEvent = async (eventData) => {
  const { data, error } = await supabase
    .from('events')
    .insert([eventData])
    .select()
    .single();
    
  if (error) throw error;
  return data;
};`}
                    language="typescript"
                  />
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">مثال على إنشاء مكون</h3>
                  <CodeBlock
                    code={`import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ExampleCardProps {
  title: string;
  description: string;
  onAction: () => void;
}

export const ExampleCard = ({ title, description, onAction }: ExampleCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{description}</p>
        <Button onClick={onAction} className="mt-4">تنفيذ</Button>
      </CardContent>
    </Card>
  );
};`}
                    language="typescript"
                  />
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">مثال على استخدام React Query</h3>
                  <CodeBlock
                    code={`import { useQuery } from '@tanstack/react-query';
import { fetchEvents } from '@/api/events';

const EventsList = () => {
  const { 
    data: events, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents
  });
  
  if (isLoading) return <p>جار التحميل...</p>;
  if (error) return <p>حدث خطأ</p>;
  
  return (
    <div>
      {events.map(event => (
        <div key={event.id}>{event.title}</div>
      ))}
    </div>
  );
};`}
                    language="typescript"
                  />
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">مثال على استخدام مخزن Zustand</h3>
                  <CodeBlock
                    code={`// src/store/counterStore.ts
import { create } from 'zustand';

interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

export const useCounterStore = create<CounterState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 })
}));

// استخدام المخزن في المكون
const CounterComponent = () => {
  const { count, increment, decrement, reset } = useCounterStore();
  
  return (
    <div>
      <p>العداد: {count}</p>
      <button onClick={increment}>زيادة</button>
      <button onClick={decrement}>نقصان</button>
      <button onClick={reset}>إعادة تعيين</button>
    </div>
  );
};`}
                    language="typescript"
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="installation">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">متطلبات البيئة</h3>
                  <div className="border rounded-md p-3 bg-muted">
                    <code className="text-sm block">
                      Node.js &gt;= 18.x<br />
                      npm &gt;= 9.x
                    </code>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">تثبيت وتشغيل المشروع</h3>
                  <div className="space-y-2">
                    <p className="text-sm">1. تثبيت التبعيات:</p>
                    <code className="text-sm block bg-card p-2 rounded">
                      npm install
                    </code>
                    
                    <p className="text-sm mt-4">2. تكوين ملف البيئة:</p>
                    <div className="bg-card p-2 rounded">
                      <code className="text-sm block">
                        # .env<br />
                        VITE_SUPABASE_URL=your_supabase_url<br />
                        VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
                      </code>
                    </div>
                    
                    <p className="text-sm mt-4">3. تشغيل التطبيق في بيئة التطوير:</p>
                    <code className="text-sm block bg-card p-2 rounded">
                      npm run dev
                    </code>
                    
                    <p className="text-sm mt-4">4. بناء التطبيق للإنتاج:</p>
                    <code className="text-sm block bg-card p-2 rounded">
                      npm run build
                    </code>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">الوصول إلى لوحة تحكم المطورين</h3>
                  <div className="border rounded-md p-3 bg-muted">
                    <p className="text-sm mb-2">
                      1. تسجيل الدخول بحساب مدير النظام<br />
                      2. الانتقال إلى مسار: <code>/admin/developer-settings</code><br />
                      3. إذا لم يكن لديك صلاحيات المطور، اضغط على زر "تعيين دور المطور لحسابي"
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <Separator className="my-6" />
          
          <div>
            <h3 className="text-lg font-semibold mb-4">الأدوات المساعدة للمطورين</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">إعدادات التصحيح</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    يمكن التحكم بمستوى التصحيح من خلال تغيير إعدادات المطورين.
                    المسار: <code>/admin/developer-settings?tab=debug</code>
                  </p>
                </CardContent>
              </Card>
              
              <Card className="h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">أدوات التخزين المؤقت</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    يمكن ضبط إعدادات التخزين المؤقت من خلال قسم الذاكرة المؤقتة.
                    المسار: <code>/admin/developer-settings?tab=cache</code>
                  </p>
                </CardContent>
              </Card>
              
              <Card className="h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">وسائل التسجيل</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    يمكن الوصول إلى سجلات النظام من خلال قسم السجلات.
                    المسار: <code>/admin/developer-settings?tab=logs</code>
                  </p>
                </CardContent>
              </Card>
              
              <Card className="h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">مراقبة الأداء</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    يمكن مراقبة أداء التطبيق من خلال قسم الأداء.
                    المسار: <code>/admin/developer-settings?tab=performance</code>
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
