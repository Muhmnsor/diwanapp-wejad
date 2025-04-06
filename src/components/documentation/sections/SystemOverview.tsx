
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModuleCard } from "../components/ModuleCard";
import { 
  LayoutDashboard, 
  Calendar, 
  FileText, 
  Users, 
  BoxSelect,
  Database,
  Code,
  Settings,
  Briefcase,
  CreditCard,
  MessageSquare,
  BellRing,
  Mail
} from "lucide-react";

export const SystemOverview = () => {
  return (
    <Card className="w-full bg-white">
      <CardHeader>
        <CardTitle>نظرة عامة على النظام</CardTitle>
        <CardDescription>النظرة الشاملة لمكونات وهيكلية النظام</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="core" className="w-full space-y-4">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="core">المكونات الأساسية</TabsTrigger>
            <TabsTrigger value="architecture">الهيكلية والتكامل</TabsTrigger>
            <TabsTrigger value="subsystems">الأنظمة الفرعية</TabsTrigger>
          </TabsList>
          
          <TabsContent value="core" className="space-y-4">
            <div className="text-muted-foreground mb-4">
              <p>يتكون النظام من مجموعة مترابطة من المكونات الأساسية التي تتكامل معاً لتوفير منصة متكاملة.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <ModuleCard 
                title="إدارة الفعاليات" 
                description="تنظيم وإدارة الفعاليات، التسجيل، الحضور، والشهادات" 
                icon={<Calendar className="h-6 w-6 text-primary" />}
                href="#components?section=events"
              />
              
              <ModuleCard 
                title="إدارة المشاريع" 
                description="إنشاء وإدارة المشاريع والأنشطة المرتبطة بها" 
                icon={<BoxSelect className="h-6 w-6 text-primary" />}
                href="#components?section=projects"
              />
              
              <ModuleCard 
                title="قاعدة البيانات" 
                description="هيكل البيانات والعلاقات بين الجداول" 
                icon={<Database className="h-6 w-6 text-primary" />}
                href="#database"
              />
              
              <ModuleCard 
                title="واجهة المستخدم" 
                description="المكونات والتصميم البصري للنظام" 
                icon={<LayoutDashboard className="h-6 w-6 text-primary" />}
                href="#ui"
              />
              
              <ModuleCard 
                title="المعلومات التقنية" 
                description="المعلومات التقنية والبرمجية للنظام" 
                icon={<Code className="h-6 w-6 text-primary" />}
                href="#technical"
              />
              
              <ModuleCard 
                title="الموارد البشرية" 
                description="إدارة الموظفين والموارد البشرية" 
                icon={<Users className="h-6 w-6 text-primary" />}
                href="#components?section=hr"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="architecture" className="space-y-4">
            <div className="text-muted-foreground mb-4">
              <p>يعتمد النظام على هندسة متعددة الطبقات مع واجهة مستخدم تفاعلية وخدمات خلفية قوية.</p>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">هيكلية النظام</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative p-4 bg-secondary/20 rounded-md">
                    <div className="mb-6 border-b pb-4">
                      <h4 className="text-primary font-medium mb-2">طبقة واجهة المستخدم - Frontend</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mr-4">
                        <li>React و TypeScript - الهيكل الأساسي للتطبيق</li>
                        <li>Tailwind CSS - نظام التصميم والتنسيق</li>
                        <li>Lucide Icons - مكتبة الأيقونات</li>
                        <li>Shadcn/UI - مكونات واجهة المستخدم</li>
                      </ul>
                    </div>
                    
                    <div className="mb-6 border-b pb-4">
                      <h4 className="text-primary font-medium mb-2">طبقة إدارة الحالة والطلبات - State Management</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mr-4">
                        <li>Zustand - إدارة حالة التطبيق</li>
                        <li>TanStack Query - إدارة طلبات البيانات والتخزين المؤقت</li>
                        <li>React Router - التنقل بين الصفحات</li>
                      </ul>
                    </div>
                    
                    <div className="mb-2">
                      <h4 className="text-primary font-medium mb-2">طبقة الخدمات الخلفية - Backend</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mr-4">
                        <li>Supabase - قاعدة البيانات وخدمات الخلفية</li>
                        <li>EdgeFunctions - معالجة العمليات المعقدة</li>
                        <li>PostgreSQL - قاعدة البيانات العلائقية</li>
                        <li>Row Level Security - سياسات الأمان على مستوى الصفوف</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">مخطط التكامل</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-secondary/20 rounded-md text-sm text-muted-foreground">
                    <p className="mb-4">يتفاعل النظام مع عدة خدمات خارجية لتوفير مجموعة كاملة من الوظائف:</p>
                    
                    <ul className="list-disc list-inside space-y-3 mr-4">
                      <li className="font-medium text-foreground">تكامل خدمات الرسائل
                        <p className="font-normal text-muted-foreground mt-1">تكامل مع خدمات WhatsApp Business API لإرسال إشعارات وتأكيدات للمستخدمين</p>
                      </li>
                      
                      <li className="font-medium text-foreground">تكامل إدارة المشاريع
                        <p className="font-normal text-muted-foreground mt-1">ربط مع خدمات مثل Asana لمزامنة المهام والمشاريع</p>
                      </li>
                      
                      <li className="font-medium text-foreground">تكامل إدارة الملفات
                        <p className="font-normal text-muted-foreground mt-1">استخدام Supabase Storage لتخزين الملفات والصور</p>
                      </li>
                      
                      <li className="font-medium text-foreground">تكامل المدفوعات
                        <p className="font-normal text-muted-foreground mt-1">واجهة برمجية للربط مع بوابات الدفع الإلكتروني</p>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="subsystems" className="space-y-4">
            <div className="text-muted-foreground mb-4">
              <p>يتضمن النظام عدة أنظمة فرعية متكاملة تعمل معاً لتوفير تجربة مستخدم شاملة.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <ModuleCard 
                title="نظام المحاسبة" 
                description="إدارة المدخلات والمصروفات والعمليات المالية" 
                icon={<CreditCard className="h-6 w-6 text-primary" />}
                href="/admin/accounting"
              />
              
              <ModuleCard 
                title="نظام الموارد البشرية" 
                description="إدارة الموظفين والحضور والإجازات" 
                icon={<Briefcase className="h-6 w-6 text-primary" />}
                href="/admin/hr"
              />
              
              <ModuleCard 
                title="نظام إدارة الوثائق" 
                description="تخزين وإدارة الملفات والمستندات" 
                icon={<FileText className="h-6 w-6 text-primary" />}
                href="/documents"
              />
              
              <ModuleCard 
                title="نظام إدارة المستخدمين" 
                description="إدارة المستخدمين والصلاحيات" 
                icon={<Settings className="h-6 w-6 text-primary" />}
                href="/admin/users-management"
              />
              
              <ModuleCard 
                title="نظام الاجتماعات" 
                description="جدولة وإدارة الاجتماعات ومحاضر الجلسات" 
                icon={<MessageSquare className="h-6 w-6 text-primary" />}
                href="/admin/meetings"
              />
              
              <ModuleCard 
                title="البريد الداخلي" 
                description="نظام المراسلات الداخلية" 
                icon={<Mail className="h-6 w-6 text-primary" />}
                href="/admin/internal-mail"
              />
              
              <ModuleCard 
                title="نظام الإشعارات" 
                description="إدارة وإرسال الإشعارات للمستخدمين" 
                icon={<BellRing className="h-6 w-6 text-primary" />}
                href="/notifications"
              />
              
              <ModuleCard 
                title="نظام إدارة الحسابات الرقمية" 
                description="إدارة الاشتراكات والخدمات الرقمية" 
                icon={<Database className="h-6 w-6 text-primary" />}
                href="/"
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
