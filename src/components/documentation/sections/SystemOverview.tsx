
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ModuleCard } from "../components/ModuleCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

export const SystemOverview = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>نظرة عامة على النظام</CardTitle>
          <CardDescription>
            وصف عام للنظام والغرض منه والمستخدمين المستهدفين
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            هذا النظام عبارة عن منصة متكاملة لإدارة الفعاليات والمشاريع وتتبع المهام وإدارة الموارد، مصممة خصيصًا للمؤسسات
            والمنظمات التي تدير العديد من الفعاليات والمشاريع المتزامنة.
          </p>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              يعتمد النظام على تقنيات متعددة منها React, TypeScript, Supabase, واجهات مستخدم مخصصة، ويتيح استخدامه من خلال متصفح الويب.
            </AlertDescription>
          </Alert>

          <h3 className="text-lg font-semibold mt-4 mb-2">الأنظمة الفرعية الرئيسية</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ModuleCard 
              title="نظام إدارة الفعاليات" 
              description="إدارة الفعاليات والأنشطة، التسجيل، الحضور، التقييم، إصدار الشهادات" 
              path="/events"
            />
            <ModuleCard 
              title="نظام إدارة المشاريع" 
              description="إدارة المشاريع، الأنشطة، المشاركين، متابعة التقدم، المراحل والمهام" 
              path="/projects"
            />
            <ModuleCard 
              title="نظام المحافظ" 
              description="إدارة محافظ المشاريع، مساحات العمل، المهام، التقارير والمتابعة" 
              path="/portfolios"
            />
            <ModuleCard 
              title="نظام إدارة المهام" 
              description="إنشاء المهام، تعيين المسؤوليات، متابعة الإنجاز، التسليمات والمرفقات" 
              path="/tasks"
            />
            <ModuleCard 
              title="نظام الأفكار والمبادرات" 
              description="إدارة الأفكار، التصويت، المناقشات، الموافقات، متابعة التنفيذ" 
              path="/ideas"
            />
            <ModuleCard 
              title="نظام إدارة الشهادات" 
              description="إصدار الشهادات، التوقيعات، التحقق، القوالب والتصاميم" 
              path="/certificates"
            />
            <ModuleCard 
              title="نظام التقارير والإحصائيات" 
              description="إصدار التقارير، الإحصائيات، مؤشرات الأداء، التحليلات" 
              path="/admin/dashboard"
            />
            <ModuleCard 
              title="نظام إدارة الموارد المالية" 
              description="إدارة الموارد، المصروفات، الميزانيات، التقارير المالية" 
              path="/financial"
            />
            <ModuleCard 
              title="نظام الإشعارات والرسائل" 
              description="إدارة الإشعارات، قوالب الرسائل، التواصل عبر الواتساب" 
              path="/notifications"
            />
            <ModuleCard 
              title="نظام إدارة المستندات" 
              description="إدارة المستندات، التصنيف، الأرشفة، متابعة الصلاحية" 
              path="/documents"
            />
            <ModuleCard 
              title="نظام إدارة الاشتراكات" 
              description="إدارة الاشتراكات، التجديد، المدفوعات، التنبيهات" 
              path="/subscriptions"
            />
            <ModuleCard 
              title="نظام إدارة الصلاحيات" 
              description="إدارة الأدوار، الصلاحيات، المستخدمين، الوصول" 
              path="/permissions"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
