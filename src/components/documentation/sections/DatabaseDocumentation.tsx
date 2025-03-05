
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DatabaseTable } from "../components/DatabaseTable";

export const DatabaseDocumentation = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>توثيق قاعدة البيانات</CardTitle>
          <CardDescription>
            شرح تفصيلي لهيكل قاعدة البيانات والجداول والعلاقات
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <h3 className="text-lg font-semibold mb-4">الجداول الرئيسية</h3>
          
          <DatabaseTable
            title="جداول إدارة المستخدمين"
            tables={[
              { name: "profiles", description: "معلومات المستخدمين الأساسية" },
              { name: "roles", description: "الأدوار المتاحة في النظام" },
              { name: "permissions", description: "الصلاحيات المختلفة" },
              { name: "user_roles", description: "العلاقة بين المستخدمين والأدوار" },
            ]}
          />
          
          <DatabaseTable
            title="جداول إدارة الفعاليات"
            tables={[
              { name: "events", description: "الفعاليات والأنشطة" },
              { name: "registrations", description: "تسجيلات المشاركين" },
              { name: "attendance_records", description: "سجلات الحضور" },
              { name: "event_feedback", description: "تقييمات الفعاليات" },
              { name: "event_reports", description: "تقارير الفعاليات" },
            ]}
          />
          
          <DatabaseTable
            title="جداول إدارة المشاريع"
            tables={[
              { name: "projects", description: "المشاريع الأساسية" },
              { name: "project_activities", description: "أنشطة المشاريع" },
              { name: "project_stages", description: "مراحل المشاريع" },
              { name: "project_tasks", description: "مهام المشاريع" },
            ]}
          />
          
          <DatabaseTable
            title="جداول إدارة المهام"
            tables={[
              { name: "tasks", description: "المهام الرئيسية" },
              { name: "subtasks", description: "المهام الفرعية" },
              { name: "task_comments", description: "تعليقات المهام" },
              { name: "task_attachments", description: "مرفقات المهام" },
              { name: "task_history", description: "سجل تغييرات المهام" },
            ]}
          />
          
          <DatabaseTable
            title="جداول إدارة المحافظ"
            tables={[
              { name: "portfolios", description: "المحافظ الرئيسية" },
              { name: "portfolio_workspaces", description: "مساحات العمل" },
              { name: "portfolio_projects", description: "مشاريع المحافظ" },
              { name: "portfolio_tasks", description: "مهام المحافظ" },
            ]}
          />
          
          <DatabaseTable
            title="جداول الإشعارات"
            tables={[
              { name: "whatsapp_settings", description: "إعدادات الواتساب" },
              { name: "whatsapp_templates", description: "قوالب رسائل الواتساب" },
              { name: "notification_logs", description: "سجلات الإشعارات المرسلة" },
            ]}
          />
          
          <DatabaseTable
            title="جداول الشهادات"
            tables={[
              { name: "certificate_templates", description: "قوالب الشهادات" },
              { name: "certificate_signatures", description: "توقيعات الشهادات" },
              { name: "certificates", description: "الشهادات المصدرة" },
              { name: "certificate_verifications", description: "عمليات التحقق من الشهادات" },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
};
