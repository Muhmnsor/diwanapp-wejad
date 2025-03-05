
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UIFeatureCard } from "../components/UIFeatureCard";

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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
