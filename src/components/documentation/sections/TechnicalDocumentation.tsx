
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeBlock } from "../components/CodeBlock";

export const TechnicalDocumentation = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>المعلومات التقنية</CardTitle>
        <CardDescription>المعلومات التقنية والبرمجية للنظام</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="architecture">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="architecture">هيكلة التطبيق</TabsTrigger>
            <TabsTrigger value="database">قاعدة البيانات</TabsTrigger>
            <TabsTrigger value="api">واجهات برمجة التطبيقات</TabsTrigger>
            <TabsTrigger value="auth">نظام المصادقة</TabsTrigger>
          </TabsList>
          
          <TabsContent value="architecture" className="space-y-6">
            <Card className="bg-secondary/10">
              <CardHeader>
                <CardTitle className="text-lg">هيكلة المجلدات</CardTitle>
                <CardDescription>التنظيم الهيكلي لمجلدات المشروع</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="font-mono text-sm bg-background p-4 rounded-md overflow-auto max-h-80">
                  <div className="text-primary">src/</div>
                  <div className="pl-6 text-muted-foreground">├── components/</div>
                  <div className="pl-12">├── ui/ (مكونات واجهة المستخدم الأساسية)</div>
                  <div className="pl-12">├── layout/ (مكونات التخطيط)</div>
                  <div className="pl-12">├── events/ (مكونات الفعاليات)</div>
                  <div className="pl-12">├── projects/ (مكونات المشاريع)</div>
                  <div className="pl-12">├── admin/ (مكونات لوحة الإدارة)</div>
                  <div className="pl-12">├── hr/ (مكونات الموارد البشرية)</div>
                  <div className="pl-12">└── finance/ (مكونات المالية)</div>
                  <div className="pl-6 text-muted-foreground">├── hooks/</div>
                  <div className="pl-12">├── useAuth.tsx (مصادقة المستخدمين)</div>
                  <div className="pl-12">├── useNotifications.ts (إدارة الإشعارات)</div>
                  <div className="pl-12">└── useEvents.ts (إدارة الفعاليات)</div>
                  <div className="pl-6 text-muted-foreground">├── pages/</div>
                  <div className="pl-12">└── (صفحات التطبيق)</div>
                  <div className="pl-6 text-muted-foreground">├── lib/</div>
                  <div className="pl-12">└── (المكتبات والأدوات المساعدة)</div>
                  <div className="pl-6 text-muted-foreground">├── store/</div>
                  <div className="pl-12">└── (حالة التطبيق - Zustand)</div>
                  <div className="pl-6 text-muted-foreground">├── integrations/</div>
                  <div className="pl-12">└── supabase/ (تكامل Supabase)</div>
                  <div className="pl-6 text-muted-foreground">├── types/</div>
                  <div className="pl-12">└── (أنواع TypeScript)</div>
                  <div className="pl-6 text-muted-foreground">└── utils/</div>
                  <div className="pl-12">└── (وظائف مساعدة)</div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-secondary/10">
              <CardHeader>
                <CardTitle className="text-lg">نمط بناء التطبيق</CardTitle>
                <CardDescription>نمط العمارة البرمجية المستخدم في التطبيق</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  يستخدم التطبيق نمط الواجهة الأمامية (Frontend) المنفردة مع واجهة برمجة التطبيقات (API) الخلفية باستخدام Supabase.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="text-primary font-medium mb-2">واجهة المستخدم (Frontend)</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mr-4">
                      <li>React - مكتبة واجهة المستخدم</li>
                      <li>React Router - التنقل بين الصفحات</li>
                      <li>TanStack Query - إدارة حالة الخادم</li>
                      <li>Zustand - إدارة حالة التطبيق</li>
                      <li>Tailwind CSS - أسلوب وتنسيق</li>
                    </ul>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="text-primary font-medium mb-2">الخلفية (Backend)</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mr-4">
                      <li>Supabase - قاعدة البيانات وواجهة برمجة التطبيقات</li>
                      <li>PostgreSQL - قاعدة بيانات علائقية</li>
                      <li>Row Level Security (RLS) - أمان على مستوى الصفوف</li>
                      <li>Edge Functions - وظائف على الحافة</li>
                      <li>Storage - تخزين الملفات</li>
                    </ul>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="text-primary font-medium mb-2">إدارة الحالة (State Management)</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    يستخدم التطبيق مزيجًا من أنماط إدارة الحالة:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mr-4">
                    <li>Zustand - لإدارة حالة التطبيق العامة</li>
                    <li>TanStack Query - لإدارة حالة البيانات من الخادم</li>
                    <li>React Context - للمكونات المشتركة بين عدة مكونات</li>
                    <li>التخزين المحلي - لحفظ بيانات المستخدم وتفضيلاته</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="database" className="space-y-6">
            <Card className="bg-secondary/10">
              <CardHeader>
                <CardTitle className="text-lg">تكوين قاعدة البيانات</CardTitle>
                <CardDescription>هيكلة قاعدة البيانات والجداول الرئيسية</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  يستخدم النظام قاعدة بيانات PostgreSQL المستضافة على Supabase، مع تطبيق أمان على مستوى الصفوف (RLS).
                </p>
                
                <div className="space-y-4">
                  <CodeBlock 
                    code={`-- مثال على هيكل جدول الأحداث
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  location TEXT NOT NULL,
  image_url TEXT NOT NULL,
  max_attendees INTEGER NOT NULL DEFAULT 0,
  event_category TEXT NOT NULL DEFAULT 'social',
  event_path TEXT NOT NULL DEFAULT 'environment',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  is_visible BOOLEAN DEFAULT TRUE
);

-- تطبيق سياسة الأمان على مستوى الصفوف
CREATE POLICY "الزوار يمكنهم قراءة الأحداث المرئية فقط" 
  ON events FOR SELECT 
  USING (is_visible = TRUE);

CREATE POLICY "المشرفون يمكنهم تعديل الأحداث" 
  ON events FOR ALL 
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_roles 
      WHERE role_id IN (
        SELECT id FROM roles WHERE name = 'admin'
      )
    )
  );`}
                    language="sql"
                  />
                </div>
                
                <div className="mt-4">
                  <h3 className="text-primary font-medium mb-2">مميزات قاعدة البيانات:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mr-4">
                    <li>أمان على مستوى الصفوف (RLS) - تحكم دقيق بالوصول للبيانات</li>
                    <li>مشغلات (Triggers) - لتنفيذ عمليات تلقائية عند تغيير البيانات</li>
                    <li>وظائف مخصصة (Functions) - لتنفيذ منطق معقد في قاعدة البيانات</li>
                    <li>مشتركات الوقت الحقيقي (Realtime) - لتحديثات البيانات الفورية</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="api" className="space-y-6">
            <Card className="bg-secondary/10">
              <CardHeader>
                <CardTitle className="text-lg">واجهات برمجة التطبيقات</CardTitle>
                <CardDescription>واجهات API وكيفية استخدامها</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  يتم استخدام عميل Supabase للوصول إلى قاعدة البيانات وتنفيذ العمليات عليها.
                </p>
                
                <CodeBlock 
                  code={`// مثال للوصول إلى الأحداث
import { supabase } from '@/integrations/supabase/client';

// استرجاع جميع الأحداث المرئية
export const getVisibleEvents = async () => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('is_visible', true)
    .order('date', { ascending: true });
    
  if (error) {
    console.error('خطأ في استرجاع الأحداث:', error);
    throw error;
  }
  
  return data;
};

// إنشاء حدث جديد
export const createEvent = async (eventData) => {
  const { data, error } = await supabase
    .from('events')
    .insert([eventData])
    .select('*')
    .single();
    
  if (error) {
    console.error('خطأ في إنشاء الحدث:', error);
    throw error;
  }
  
  return data;
};`}
                  language="typescript"
                />
                
                <h3 className="text-primary font-medium mt-6 mb-2">Edge Functions</h3>
                <p className="text-muted-foreground mb-4">
                  تُستخدم Edge Functions لتنفيذ منطق برمجي معقد لا يمكن تنفيذه من خلال قواعد RLS.
                </p>
                
                <CodeBlock 
                  code={`// مثال لاستدعاء Edge Function
import { supabase } from '@/integrations/supabase/client';

export const sendEventReminders = async (eventId) => {
  const { data, error } = await supabase
    .functions
    .invoke('send-event-reminders', {
      body: { eventId }
    });
    
  if (error) {
    console.error('خطأ في إرسال التذكيرات:', error);
    throw error;
  }
  
  return data;
};`}
                  language="typescript"
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="auth" className="space-y-6">
            <Card className="bg-secondary/10">
              <CardHeader>
                <CardTitle className="text-lg">نظام المصادقة</CardTitle>
                <CardDescription>مصادقة المستخدمين وإدارة الجلسات</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  يستخدم النظام مصادقة Supabase مع تطبيق نظام الأدوار والصلاحيات المخصص.
                </p>
                
                <CodeBlock 
                  code={`// استخدام مصادقة Supabase
import { supabase } from '@/integrations/supabase/client';

// تسجيل الدخول باستخدام البريد الإلكتروني وكلمة المرور
export const signInWithEmail = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) {
    console.error('خطأ في تسجيل الدخول:', error);
    throw error;
  }
  
  return data;
};

// استخدام hook لإدارة المصادقة
import { useAuthStore } from '@/store/refactored-auth';

export const useAuth = () => {
  const { user, isAuthenticated } = useAuthStore();
  
  // التحقق من صلاحية المستخدم
  const checkUserRole = async (role) => {
    if (!isAuthenticated || !user) return false;
    
    const { data } = await supabase
      .from('user_roles')
      .select('roles:role_id(name)')
      .eq('user_id', user.id);
      
    return data?.some(userRole => {
      const roleName = userRole.roles && typeof userRole.roles === 'object' ? 
        userRole.roles.name : null;
      return roleName === role;
    });
  };
  
  return {
    user,
    isAuthenticated,
    checkUserRole
  };
};`}
                  language="typescript"
                />
                
                <h3 className="text-primary font-medium mt-6 mb-2">نظام الأدوار والصلاحيات</h3>
                <p className="text-muted-foreground mb-4">
                  يستخدم النظام نظام أدوار مخصص لإدارة صلاحيات المستخدمين.
                </p>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">الأدوار الرئيسية:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mr-4">
                    <li>مدير النظام (admin) - وصول كامل لجميع الميزات</li>
                    <li>مشرف (moderator) - إدارة المحتوى والمستخدمين</li>
                    <li>مستخدم (user) - استخدام الميزات الأساسية</li>
                    <li>مطور (developer) - وصول لأدوات التطوير والتشخيص</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
