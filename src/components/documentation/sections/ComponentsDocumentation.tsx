
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion } from "@/components/ui/accordion";
import { DocumentationSection } from "../components/DocumentationSection";

export const ComponentsDocumentation = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>توثيق المكونات الرئيسية</CardTitle>
          <CardDescription>
            شرح تفصيلي للمكونات الرئيسية في النظام
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <DocumentationSection
              title="نظام إدارة الفعاليات"
              content={[
                { title: "إنشاء الفعاليات", description: "إنشاء وتحرير الفعاليات مع تحديد التفاصيل الكاملة والصور والموقع." },
                { title: "التسجيل في الفعاليات", description: "نظام تسجيل متكامل مع خيارات الحقول المطلوبة والتحقق." },
                { title: "إدارة الحضور", description: "تسجيل الحضور عبر QR أو رقم التسجيل مع الإحصائيات." },
                { title: "التقييم والملاحظات", description: "جمع التقييمات والملاحظات مع تحليل النتائج." },
                { title: "إصدار الشهادات", description: "إصدار شهادات الحضور والمشاركة مع التحقق." },
                { title: "إدارة التواصل", description: "إرسال التنبيهات والرسائل للمشاركين عبر الواتساب." },
              ]}
            />
            
            <DocumentationSection
              title="نظام إدارة المشاريع"
              content={[
                { title: "إنشاء المشاريع", description: "إنشاء المشاريع مع تحديد الأهداف والجدول الزمني والميزانية." },
                { title: "إدارة الأنشطة", description: "تخطيط وجدولة الأنشطة مع متابعة التنفيذ." },
                { title: "إدارة المشاركين", description: "تسجيل وإدارة المشاركين في المشروع." },
                { title: "متابعة التقدم", description: "لوحات متابعة ومؤشرات أداء تفاعلية." },
                { title: "التقارير", description: "إنشاء تقارير تفصيلية عن سير المشروع." },
                { title: "إدارة المراحل", description: "تقسيم المشروع إلى مراحل مع تتبع الإنجاز." },
              ]}
            />

            <DocumentationSection
              title="نظام المحافظ"
              content={[
                { title: "إنشاء المحافظ", description: "إنشاء وتنظيم محافظ المشاريع." },
                { title: "مساحات العمل", description: "إدارة مساحات العمل والفرق." },
                { title: "المهام والمتابعة", description: "إدارة مهام المحفظة ومتابعة التقدم." },
                { title: "التكامل مع Asana", description: "مزامنة البيانات مع منصة Asana." },
                { title: "التقارير", description: "تقارير وإحصائيات أداء المحافظ." },
              ]}
            />

            <DocumentationSection
              title="نظام إدارة المهام"
              content={[
                { title: "إنشاء المهام", description: "إنشاء مهام مع تحديد التفاصيل والمواعيد." },
                { title: "المهام الفرعية", description: "تقسيم المهام إلى مهام فرعية." },
                { title: "التسليمات", description: "إدارة تسليمات المهام والمرفقات." },
                { title: "المناقشات", description: "نظام تعليقات ومناقشات للمهام." },
                { title: "المهام المتكررة", description: "إنشاء وجدولة المهام المتكررة." },
                { title: "متابعة الأداء", description: "قياس ومتابعة أداء المهام والفريق." },
              ]}
            />

            <DocumentationSection
              title="نظام الأفكار والمبادرات"
              content={[
                { title: "تقديم الأفكار", description: "نظام متكامل لتقديم ومناقشة الأفكار." },
                { title: "التصويت والتقييم", description: "آلية تصويت وتقييم للأفكار المقترحة." },
                { title: "المناقشات", description: "منصة للمناقشات وإبداء الآراء." },
                { title: "مسار الموافقات", description: "متابعة مسار الموافقات على المبادرات." },
                { title: "التنفيذ", description: "تحويل الأفكار إلى مشاريع وخطط تنفيذية." },
              ]}
            />

            <DocumentationSection
              title="نظام إدارة الشهادات"
              content={[
                { title: "قوالب الشهادات", description: "إنشاء وتحرير قوالب الشهادات." },
                { title: "التوقيعات", description: "إدارة التوقيعات المعتمدة." },
                { title: "الإصدار", description: "إصدار الشهادات للمستفيدين." },
                { title: "التحقق", description: "نظام التحقق من صحة الشهادات." },
                { title: "السجلات", description: "حفظ سجلات الشهادات والتحقق." },
              ]}
            />

            <DocumentationSection
              title="نظام الإشعارات والرسائل"
              content={[
                { title: "قوالب الرسائل", description: "إدارة قوالب الرسائل والإشعارات." },
                { title: "تكامل الواتساب", description: "إرسال الرسائل عبر الواتساب." },
                { title: "الإشعارات الداخلية", description: "نظام الإشعارات داخل التطبيق." },
                { title: "التفضيلات", description: "إدارة تفضيلات الإشعارات للمستخدمين." },
                { title: "سجلات الإرسال", description: "متابعة سجلات إرسال الإشعارات." },
              ]}
            />

            <DocumentationSection
              title="نظام إدارة الموارد المالية"
              content={[
                { title: "إدارة الموارد", description: "تسجيل وإدارة الموارد المالية." },
                { title: "المصروفات", description: "تتبع وإدارة المصروفات." },
                { title: "الميزانيات", description: "تخطيط وإدارة الميزانيات." },
                { title: "التقارير المالية", description: "إعداد التقارير والتحليلات المالية." },
                { title: "المستهدفات", description: "تحديد ومتابعة المستهدفات المالية." },
              ]}
            />

            <DocumentationSection
              title="نظام إدارة المستندات"
              content={[
                { title: "تنظيم المستندات", description: "تصنيف وتنظيم المستندات." },
                { title: "متابعة الصلاحية", description: "تتبع صلاحية المستندات." },
                { title: "الأرشفة", description: "أرشفة المستندات وحفظها." },
                { title: "البحث", description: "نظام بحث متقدم في المستندات." },
                { title: "التنبيهات", description: "تنبيهات تجديد المستندات." },
              ]}
            />

            <DocumentationSection
              title="نظام إدارة الصلاحيات"
              content={[
                { title: "الأدوار", description: "تعريف وإدارة الأدوار." },
                { title: "الصلاحيات", description: "تحديد الصلاحيات لكل دور." },
                { title: "المستخدمين", description: "إدارة المستخدمين وأدوارهم." },
                { title: "الوصول", description: "التحكم في صلاحيات الوصول." },
                { title: "السجلات", description: "سجلات الوصول والتغييرات." },
              ]}
            />
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};
