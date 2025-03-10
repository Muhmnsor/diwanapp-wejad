
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
            <TabsList className="grid grid-cols-6 mb-4">
              <TabsTrigger value="tech-stack">التقنيات المستخدمة</TabsTrigger>
              <TabsTrigger value="architecture">هيكل المشروع</TabsTrigger>
              <TabsTrigger value="code-examples">أمثلة الأكواد</TabsTrigger>
              <TabsTrigger value="integrations">التكاملات الخارجية</TabsTrigger>
              <TabsTrigger value="troubleshooting">استكشاف الأخطاء</TabsTrigger>
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
                  <TableRow>
                    <TableCell>PDF-Lib</TableCell>
                    <TableCell>^1.17.1</TableCell>
                    <TableCell>إنشاء وتعديل ملفات PDF</TableCell>
                    <TableCell><code>src/components/certificates/</code></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>XLSX</TableCell>
                    <TableCell>^0.18.5</TableCell>
                    <TableCell>تصدير البيانات إلى Excel</TableCell>
                    <TableCell><code>src/components/admin/ExportButton.tsx</code></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>html-to-image</TableCell>
                    <TableCell>^1.11.11</TableCell>
                    <TableCell>تحويل HTML إلى صور</TableCell>
                    <TableCell><code>src/utils/exportUtils.ts</code></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>JSZip</TableCell>
                    <TableCell>^3.10.1</TableCell>
                    <TableCell>ضغط الملفات</TableCell>
                    <TableCell><code>src/components/ideas/details/</code></TableCell>
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
                        
                        {/* Core Components */}
                        <div className="mr-6"><Badge variant="outline" className="mr-2">📁</Badge> components/ - مكونات التطبيق المختلفة</div>
                        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> activities/ - مكونات الأنشطة والفعاليات</div>
                        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> admin/ - مكونات لوحة التحكم</div>
                        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> certificates/ - مكونات إدارة الشهادات</div>
                        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> dashboard/ - مكونات لوحة القيادة</div>
                        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> developer/ - أدوات المطور</div>
                        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> documentation/ - مكونات التوثيق</div>
                        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> events/ - مكونات الفعاليات</div>
                        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> finance/ - المكونات المالية</div>
                        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> ideas/ - مكونات إدارة الأفكار</div>
                        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> layout/ - مكونات التخطيط العام</div>
                        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> projects/ - مكونات المشاريع</div>
                        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> requests/ - مكونات الطلبات</div>
                        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> settings/ - مكونات الإعدادات</div>
                        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> tasks/ - مكونات المهام</div>
                        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> ui/ - مكونات واجهة المستخدم الأساسية</div>
                        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> users/ - مكونات إدارة المستخدمين</div>
                        
                        {/* Core App Files */}
                        <div className="mr-6"><Badge variant="outline" className="mr-2">📁</Badge> pages/ - صفحات التطبيق</div>
                        <div className="mr-6"><Badge variant="outline" className="mr-2">📁</Badge> hooks/ - الدوال الخطافية</div>
                        <div className="mr-6"><Badge variant="outline" className="mr-2">📁</Badge> integrations/ - تكامل مع الخدمات الخارجية</div>
                        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> supabase/ - تكامل مع Supabase</div>
                        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> whatsapp/ - تكامل مع WhatsApp</div>
                        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> asana/ - تكامل مع Asana</div>
                        
                        {/* State Management */}
                        <div className="mr-6"><Badge variant="outline" className="mr-2">📁</Badge> store/ - مخازن حالة التطبيق</div>
                        <div className="mr-12"><Badge variant="outline" className="mr-2">📄</Badge> authStore.ts - إدارة المصادقة</div>
                        <div className="mr-12"><Badge variant="outline" className="mr-2">📄</Badge> eventStore.ts - إدارة الفعاليات</div>
                        <div className="mr-12"><Badge variant="outline" className="mr-2">📄</Badge> financeStore.ts - إدارة الموارد المالية</div>
                        <div className="mr-12"><Badge variant="outline" className="mr-2">📄</Badge> portfolioStore.ts - إدارة المحافظ</div>
                        <div className="mr-12"><Badge variant="outline" className="mr-2">📄</Badge> notificationsStore.ts - إدارة الإشعارات</div>
                        <div className="mr-12"><Badge variant="outline" className="mr-2">📄</Badge> documentsStore.ts - إدارة المستندات</div>
                        
                        {/* Utils and Types */}
                        <div className="mr-6"><Badge variant="outline" className="mr-2">📁</Badge> utils/ - دوال مساعدة</div>
                        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> export/ - تصدير البيانات</div>
                        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> files/ - إدارة الملفات</div>
                        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> print/ - الطباعة</div>
                        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> reports/ - التقارير</div>
                        <div className="mr-6"><Badge variant="outline" className="mr-2">📁</Badge> types/ - التعريفات النمطية</div>
                      </code>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="subsystems">
                  <AccordionTrigger>الأنظمة الفرعية</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">نظام إدارة الأفكار</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>إدارة مقترحات المشاريع والأفكار</li>
                          <li>نظام التصويت والتعليقات</li>
                          <li>متابعة حالة الأفكار</li>
                          <li>تحميل الملفات الداعمة</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">نظام إدارة المستندات</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>تخزين وتنظيم المستندات</li>
                          <li>تتبع تواريخ الانتهاء</li>
                          <li>إدارة الإصدارات</li>
                          <li>التحكم في الصلاحيات</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">نظام الطلبات</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>إنشاء وإدارة نماذج الطلبات</li>
                          <li>تدفق العمل والموافقات</li>
                          <li>متابعة حالة الطلبات</li>
                          <li>إشعارات تلقائية</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">نظام الصلاحيات</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>إدارة الأدوار والصلاحيات</li>
                          <li>تحكم دقيق بالوصول</li>
                          <li>سجلات الأنشطة</li>
                          <li>التكامل مع المصادقة</li>
                        </ul>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="modules">
                  <AccordionTrigger>الوحدات الرئيسية</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">إدارة الملفات</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>رفع وتنزيل الملفات</li>
                          <li>معالجة الصور والمستندات</li>
                          <li>تخزين آمن في Supabase</li>
                          <li>تنظيم المجلدات</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">معالجة التقارير</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>إنشاء تقارير PDF</li>
                          <li>تصدير إلى Excel</li>
                          <li>رسوم بيانية تفاعلية</li>
                          <li>تخصيص القوالب</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">نظام الإشعارات</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>إشعارات في الوقت الحقيقي</li>
                          <li>رسائل WhatsApp</li>
                          <li>إشعارات البريد الإلكتروني</li>
                          <li>تخصيص الإشعارات</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">التكاملات الخارجية</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>Supabase للتخزين والمصادقة</li>
                          <li>WhatsApp للرسائل</li>
                          <li>Asana لإدارة المشاريع</li>
                          <li>خدمات أخرى</li>
                        </ul>
                      </div>
                    </div>
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
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">مثال على استخدام مكونات الطباعة</h3>
                  <CodeBlock
                    code={`import { certificateGenerator } from '@/utils/certificateUtils';

// توليد شهادة PDF
const generateCertificate = async (userData, templateId) => {
  try {
    const pdfBytes = await certificateGenerator.createCertificate({
      userData,
      templateId,
      fontSize: 14,
      fontColor: '#000000'
    });
    
    // تنزيل الشهادة
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = \`certificate-\${userData.name}.pdf\`;
    a.click();
  } catch (error) {
    console.error('Error generating certificate:', error);
  }
};`}
                    language="typescript"
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">مثال على استخدام الإشعارات</h3>
                  <CodeBlock
                    code={`import { toast } from 'sonner';
import { sendNotification } from '@/services/notificationService';

// إرسال إشعار للمستخدم
const notifyUser = async (userId, message) => {
  try {
    // إرسال إشعار للقاعدة البيانات
    await sendNotification({
      userId,
      title: 'إشعار جديد',
      message,
      type: 'info'
    });
    
    // عرض إشعار على واجهة المستخدم
    toast.success('تم إرسال الإشعار بنجاح');
  } catch (error) {
    toast.error('فشل في إرسال الإشعار');
    console.error('Error sending notification:', error);
  }
};`}
                    language="typescript"
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">مثال على استخدام Excel للتصدير</h3>
                  <CodeBlock
                    code={`import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// تصدير البيانات إلى Excel
const exportToExcel = (data, fileName = 'exported-data') => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  saveAs(blob, \`\${fileName}.xlsx\`);
};`}
                    language="typescript"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="integrations">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">تكامل Supabase</h3>
                  <p className="text-sm mb-4">يستخدم النظام Supabase كخدمة backend للمصادقة وقاعدة البيانات وتخزين الملفات.</p>
                  <CodeBlock
                    code={`import { supabase } from '@/integrations/supabase/client';

// مثال على استخدام Supabase Storage
const uploadFile = async (file, bucket = 'documents') => {
  const fileExt = file.name.split('.').pop();
  const fileName = \`\${Math.random().toString(36).slice(2)}-\${Date.now()}.\${fileExt}\`;
  const filePath = \`\${bucket}/\${fileName}\`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);
    
  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);
    
  return publicUrl;
};`}
                    language="typescript"
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">تكامل واتساب</h3>
                  <p className="text-sm mb-4">يستخدم النظام واجهة واتساب لإرسال إشعارات للمستخدمين.</p>
                  <CodeBlock
                    code={`import { sendWhatsAppMessage } from '@/services/whatsappService';

// إرسال رسالة واتساب
const sendEventReminder = async (phone, eventDetails) => {
  try {
    await sendWhatsAppMessage({
      to: phone,
      templateName: 'event_reminder',
      templateParams: {
        eventName: eventDetails.title,
        eventDate: eventDetails.date,
        eventTime: eventDetails.time,
        eventLocation: eventDetails.location
      }
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error);
    return { success: false, error };
  }
};`}
                    language="typescript"
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">تكامل Asana</h3>
                  <p className="text-sm mb-4">يستخدم النظام Asana لمزامنة المهام والمشاريع.</p>
                  <CodeBlock
                    code={`import { asanaClient } from '@/integrations/asana/client';

// إنشاء مهمة في Asana
const createAsanaTask = async (taskData) => {
  try {
    const response = await asanaClient.tasks.create({
      name: taskData.title,
      notes: taskData.description,
      workspace: taskData.workspaceId,
      projects: [taskData.projectId],
      due_on: taskData.dueDate
    });
    
    return {
      success: true,
      asanaGid: response.gid
    };
  } catch (error) {
    console.error('Error creating Asana task:', error);
    return { success: false, error };
  }
};`}
                    language="typescript"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="troubleshooting">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">مشكلات شائعة وحلولها</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>المشكلة</TableHead>
                        <TableHead>الحل</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>فشل المصادقة مع Supabase</TableCell>
                        <TableCell>
                          <ul className="list-disc list-inside">
                            <li>تأكد من تكوين مفاتيح API بشكل صحيح</li>
                            <li>تحقق من تمكين طرق المصادقة في لوحة تحكم Supabase</li>
                            <li>تحقق من الجدران النارية وسياسات CORS</li>
                          </ul>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>مشكلات في تحميل الصور</TableCell>
                        <TableCell>
                          <ul className="list-disc list-inside">
                            <li>تأكد من تكوين تخزين Supabase بشكل صحيح</li>
                            <li>تحقق من أحجام الملفات (الحد الأقصى 50 ميجابايت)</li>
                            <li>تأكد من سياسات RLS المناسبة لتخزين الملفات</li>
                          </ul>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>بطء أداء استعلامات قاعدة البيانات</TableCell>
                        <TableCell>
                          <ul className="list-disc list-inside">
                            <li>استخدم مؤشرات الجدول المناسبة</li>
                            <li>قلل من كمية البيانات المسترجعة باستخدام select الانتقائي</li>
                            <li>استخدم التخزين المؤقت للاستعلامات المتكررة</li>
                          </ul>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>أخطاء في إنشاء PDF</TableCell>
                        <TableCell>
                          <ul className="list-disc list-inside">
                            <li>تأكد من تحميل الخطوط المطلوبة</li>
                            <li>تحقق من صحة قالب الشهادة المستخدم</li>
                            <li>تأكد من أن الصور مشفرة بشكل صحيح</li>
                          </ul>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>مشكلات في تسجيل الدخول للمطورين</TableCell>
                        <TableCell>
                          <ul className="list-disc list-inside">
                            <li>تأكد من وجود سجل في جدول developer_permissions</li>
                            <li>تحقق من تعيين الأذونات الصحيحة</li>
                            <li>أعد تحميل الصفحة بعد تحديث الإعدادات</li>
                          </ul>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">سجلات وتتبع الأخطاء</h3>
                  <p className="text-sm mb-4">يمكن تتبع الأخطاء من خلال:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm mb-4">
                    <li>سجلات وحدة تحكم المتصفح</li>
                    <li>سجلات الخطأ في Edge Functions من Supabase</li>
                    <li>جدول workflow_operation_logs في قاعدة البيانات</li>
                    <li>مكون أدوات المطورين في <code>/admin/developer-settings?tab=logs</code></li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">أفضل الممارسات للتطوير</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm mb-4">
                    <li>استخدم TypeScript بشكل صحيح مع تعريفات النوع المناسبة</li>
                    <li>اتبع نمط React Query لإدارة طلبات البيانات</li>
                    <li>استخدم React.memo لمنع إعادة العرض غير الضرورية</li>
                    <li>قم بتنظيم المكونات في ملفات منفصلة منطقياً</li>
                    <li>استخدم الدوال الخطافية المخصصة لفصل المنطق عن العرض</li>
                    <li>اختبر التغييرات في بيئة التطوير قبل الدفع للإنتاج</li>
                  </ul>
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
