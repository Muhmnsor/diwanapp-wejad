
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ModuleCard } from "../components/ModuleCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Book, Database, Users, Calendar, FileText, Settings } from "lucide-react";

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
            هذا النظام عبارة عن منصة متكاملة لإدارة الفعاليات والمشاريع وتتبع المهام وإدارة الموارد البشرية والمالية،
            مصممة خصيصًا للمؤسسات والمنظمات التي تدير العديد من الأنشطة المتزامنة وتحتاج إلى نظام موحد للإدارة والمتابعة.
          </p>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              يعتمد النظام على تقنيات متعددة منها React, TypeScript, Supabase, واجهات مستخدم مخصصة،
              ويتيح استخدامه من خلال متصفح الويب مع دعم كامل للغة العربية والتوافق مع مختلف الأجهزة.
            </AlertDescription>
          </Alert>

          <h3 className="text-lg font-semibold mt-4 mb-2">الأنظمة الفرعية الرئيسية</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              path="/admin/accounting"
            />
            <ModuleCard 
              title="نظام الإشعارات والرسائل" 
              description="إدارة الإشعارات، قوالب الرسائل، التواصل عبر الواتساب" 
              path="/admin/notifications"
            />
            <ModuleCard 
              title="نظام إدارة المستندات" 
              description="إدارة المستندات، التصنيف، الأرشفة، متابعة الصلاحية" 
              path="/admin/documents"
            />
            <ModuleCard 
              title="نظام إدارة الاشتراكات" 
              description="إدارة الاشتراكات، التجديد، المدفوعات، التنبيهات" 
              path="/admin/subscriptions"
            />
            <ModuleCard 
              title="نظام إدارة الصلاحيات" 
              description="إدارة الأدوار، الصلاحيات، المستخدمين، الوصول" 
              path="/admin/permissions"
            />
            <ModuleCard 
              title="نظام الموارد البشرية" 
              description="إدارة الموظفين، العقود، الحضور، الإجازات، التعويضات، التقييم" 
              path="/admin/hr"
            />
            <ModuleCard 
              title="نظام الاجتماعات" 
              description="جدولة الاجتماعات، جداول الأعمال، محاضر الاجتماعات، متابعة القرارات" 
              path="/admin/meetings"
            />
            <ModuleCard 
              title="نظام الطلبات" 
              description="إدارة الطلبات، مسارات الموافقة، متابعة الحالة، التقارير" 
              path="/admin/requests"
            />
            <ModuleCard 
              title="نظام إدارة الحسابات الرقمية" 
              description="إدارة الحسابات الرقمية، جدولة المحتوى، متابعة التفاعل، تحليل الأداء" 
              path="/admin/digital-accounts"
            />
          </div>
          
          <h3 className="text-lg font-semibold mt-8 mb-2">علاقات النظم الفرعية</h3>
          <p className="text-muted-foreground mb-4">
            تتكامل النظم الفرعية المختلفة مع بعضها البعض لتشكيل نظامًا متكاملًا يغطي جميع احتياجات المؤسسة:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h4 className="font-medium">الفعاليات والمشاريع</h4>
                  <p className="text-sm text-muted-foreground">يمكن ربط الفعاليات بمشاريع محددة، كما يمكن إنشاء مهام مرتبطة بفعاليات أو مشاريع محددة</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h4 className="font-medium">الموارد البشرية والمهام</h4>
                  <p className="text-sm text-muted-foreground">يتكامل نظام الموارد البشرية مع نظام المهام لمتابعة إنتاجية الموظفين وتوزيع المسؤوليات</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h4 className="font-medium">المستندات والاجتماعات</h4>
                  <p className="text-sm text-muted-foreground">يمكن ربط المستندات بالاجتماعات وإرفاقها بمحاضر الاجتماعات والقرارات</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-start gap-3">
                <Database className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h4 className="font-medium">الموارد المالية والمشاريع</h4>
                  <p className="text-sm text-muted-foreground">يتم ربط الموارد المالية والمصروفات بالمشاريع والفعاليات لمتابعة التكاليف والميزانيات</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-start gap-3">
                <Book className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h4 className="font-medium">التقارير والإحصائيات</h4>
                  <p className="text-sm text-muted-foreground">يجمع نظام التقارير البيانات من جميع الأنظمة الفرعية لتقديم تحليلات شاملة ومؤشرات أداء</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-start gap-3">
                <Settings className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h4 className="font-medium">الصلاحيات والأمان</h4>
                  <p className="text-sm text-muted-foreground">يطبق نظام الصلاحيات على جميع الأنظمة الفرعية للتحكم في الوصول وحماية البيانات</p>
                </div>
              </div>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
