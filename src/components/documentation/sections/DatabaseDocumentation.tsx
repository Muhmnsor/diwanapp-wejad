
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatabaseTable } from "../components/DatabaseTable";
import { DatabaseRelationships } from "./DatabaseRelationships";

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
          <Tabs defaultValue="tables">
            <TabsList className="mb-4">
              <TabsTrigger value="tables">الجداول</TabsTrigger>
              <TabsTrigger value="relationships">العلاقات</TabsTrigger>
            </TabsList>
            
            <TabsContent value="tables" className="space-y-6">
              <h3 className="text-lg font-semibold mb-4">الجداول الرئيسية</h3>
              
              <DatabaseTable
                title="جداول المستخدمين وإعداداتهم"
                tables={[
                  { name: "profiles", description: "معلومات المستخدمين الأساسية" },
                  { name: "user_settings", description: "إعدادات المستخدمين" },
                  { name: "user_notification_preferences", description: "تفضيلات الإشعارات" },
                  { name: "user_activities", description: "سجل نشاط المستخدمين" },
                  { name: "user_performance_stats", description: "إحصائيات أداء المستخدمين" },
                  { name: "user_achievements", description: "إنجازات المستخدمين" },
                ]}
              />
              
              <DatabaseTable
                title="جداول إدارة المطورين"
                tables={[
                  { name: "developer_settings", description: "إعدادات وضع المطور" },
                  { name: "developer_permissions", description: "صلاحيات المطورين" },
                  { name: "workflow_operation_logs", description: "سجلات عمليات سير العمل" }
                ]}
              />

              <DatabaseTable
                title="جداول المستندات والأفكار"
                tables={[
                  { name: "documents", description: "المستندات والوثائق" },
                  { name: "ideas", description: "الأفكار والمقترحات" },
                  { name: "idea_comments", description: "تعليقات على الأفكار" },
                  { name: "idea_versions", description: "إصدارات الأفكار" },
                  { name: "idea_votes", description: "تصويت على الأفكار" },
                  { name: "idea_categories", description: "تصنيفات الأفكار" }
                ]}
              />
              
              <DatabaseTable
                title="جداول إدارة الطلبات"
                tables={[
                  { name: "requests", description: "الطلبات الرئيسية" },
                  { name: "request_types", description: "أنواع الطلبات" },
                  { name: "request_workflows", description: "مسارات عمل الطلبات" },
                  { name: "workflow_steps", description: "خطوات سير العمل" },
                  { name: "request_approvals", description: "موافقات الطلبات" },
                  { name: "request_attachments", description: "مرفقات الطلبات" }
                ]}
              />
              
              <DatabaseTable
                title="جداول إدارة الموارد المالية"
                tables={[
                  { name: "financial_resources", description: "الموارد المالية" },
                  { name: "resource_distributions", description: "توزيع الموارد" },
                  { name: "resource_obligations", description: "الالتزامات المالية" },
                  { name: "expenses", description: "المصروفات" },
                  { name: "budget_items", description: "بنود الميزانية" },
                  { name: "financial_targets", description: "الأهداف المالية" }
                ]}
              />
              
              <DatabaseTable
                title="جداول الاشتراكات"
                tables={[
                  { name: "subscriptions", description: "الاشتراكات الأساسية" },
                  { name: "subscription_attachments", description: "مرفقات الاشتراكات" }
                ]}
              />
              
              <DatabaseTable
                title="جداول المهام والمشاريع"
                tables={[
                  { name: "tasks", description: "المهام الرئيسية" },
                  { name: "subtasks", description: "المهام الفرعية" },
                  { name: "task_comments", description: "تعليقات المهام" },
                  { name: "task_attachments", description: "مرفقات المهام" },
                  { name: "task_history", description: "سجل تغييرات المهام" },
                  { name: "task_dependencies", description: "اعتماديات المهام" },
                  { name: "recurring_tasks", description: "المهام المتكررة" }
                ]}
              />

              <DatabaseTable
                title="جداول إدارة الفعاليات"
                tables={[
                  { name: "events", description: "الفعاليات والأنشطة" },
                  { name: "event_registration_fields", description: "حقول التسجيل في الفعاليات" },
                  { name: "event_feedback", description: "تقييمات الفعاليات" },
                  { name: "event_reports", description: "تقارير الفعاليات" },
                  { name: "event_notification_settings", description: "إعدادات إشعارات الفعاليات" }
                ]}
              />

              <DatabaseTable
                title="جداول الإشعارات"
                tables={[
                  { name: "notifications", description: "الإشعارات العامة" },
                  { name: "in_app_notifications", description: "إشعارات داخل التطبيق" },
                  { name: "notification_logs", description: "سجلات الإشعارات" },
                  { name: "whatsapp_templates", description: "قوالب رسائل الواتساب" },
                  { name: "whatsapp_settings", description: "إعدادات الواتساب" }
                ]}
              />
            </TabsContent>
            
            <TabsContent value="relationships">
              <DatabaseRelationships />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
