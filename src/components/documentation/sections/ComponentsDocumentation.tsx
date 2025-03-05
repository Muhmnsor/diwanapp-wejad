
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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
                { title: "إنشاء الفعاليات", description: "يتيح للمسؤولين إنشاء فعاليات جديدة مع تحديد التاريخ والوقت والموقع والسعة وغيرها من التفاصيل." },
                { title: "التسجيل في الفعاليات", description: "يتيح للمستخدمين التسجيل في الفعاليات وتقديم المعلومات الشخصية اللازمة." },
                { title: "إدارة الحضور", description: "يمكن المسؤولين من تسجيل حضور المشاركين في الفعاليات باستخدام رموز QR أو الإدخال اليدوي." },
                { title: "التقييم والملاحظات", description: "يتيح للمشاركين تقديم تقييمات وملاحظات حول الفعاليات التي حضروها." },
              ]}
            />
            
            <DocumentationSection
              title="نظام إدارة المشاريع"
              content={[
                { title: "إنشاء المشاريع", description: "إنشاء مشاريع جديدة مع تحديد الأهداف والجدول الزمني والميزانية." },
                { title: "إدارة الأنشطة", description: "إضافة أنشطة ضمن المشروع وتحديد تواريخها ومواقعها ومتطلباتها." },
                { title: "إدارة المشاركين", description: "تسجيل المشاركين في المشروع ومتابعة حضورهم ومشاركتهم." },
                { title: "متابعة التقدم", description: "تتبع تقدم المشروع والأنشطة وعرض المؤشرات والإحصائيات." },
              ]}
            />
            
            <DocumentationSection
              title="نظام إدارة المهام"
              content={[
                { title: "إنشاء المهام", description: "إنشاء مهام جديدة مع تحديد التفاصيل والمواعيد النهائية والأولويات." },
                { title: "تعيين المسؤوليات", description: "تعيين المهام للأشخاص المناسبين ومتابعة تنفيذها." },
                { title: "المهام الفرعية", description: "إنشاء مهام فرعية ضمن المهام الرئيسية لتقسيم العمل." },
                { title: "المناقشات والمرفقات", description: "إضافة تعليقات ومرفقات للمهام لتسهيل التواصل وتبادل المعلومات." },
              ]}
            />
            
            <DocumentationSection
              title="نظام الإشعارات والرسائل"
              content={[
                { title: "قوالب الرسائل", description: "إنشاء وتحرير قوالب للرسائل المختلفة مثل التسجيل والتذكير والتقييم." },
                { title: "إعدادات الواتساب", description: "تكوين إعدادات الاتصال بواتساب لإرسال الرسائل للمشاركين." },
                { title: "سجلات الإشعارات", description: "تتبع الإشعارات المرسلة وحالتها وتاريخ إرسالها." },
                { title: "جدولة الإشعارات", description: "إعداد جدولة لإرسال الإشعارات تلقائيًا وفق مواعيد محددة." },
              ]}
            />
            
            <DocumentationSection
              title="نظام الشهادات"
              content={[
                { title: "قوالب الشهادات", description: "إنشاء وتحرير قوالب للشهادات بتصميمات مختلفة." },
                { title: "إصدار الشهادات", description: "إصدار شهادات للمشاركين في الفعاليات والمشاريع." },
                { title: "التحقق من الشهادات", description: "إمكانية التحقق من صحة الشهادات من خلال رموز التحقق." },
                { title: "التوقيعات", description: "إدارة التوقيعات المستخدمة في الشهادات." },
              ]}
            />
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};
