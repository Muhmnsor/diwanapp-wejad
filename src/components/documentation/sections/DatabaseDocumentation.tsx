
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatabaseTable } from "../components/DatabaseTable";

export const DatabaseDocumentation = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>توثيق قاعدة البيانات</CardTitle>
        <CardDescription>هيكل قاعدة البيانات والعلاقات بين الجداول</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="core">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="core">الجداول الأساسية</TabsTrigger>
            <TabsTrigger value="hr">الموارد البشرية</TabsTrigger>
            <TabsTrigger value="finance">المالية</TabsTrigger>
            <TabsTrigger value="system">النظام</TabsTrigger>
          </TabsList>
          
          <TabsContent value="core" className="space-y-4">
            <div className="text-muted-foreground mb-4">
              <p>الجداول الأساسية التي تمثل الكيانات الرئيسية في النظام</p>
            </div>
            
            <DatabaseTable 
              title="events" 
              tables={[
                { name: "events", description: "جدول الأحداث والفعاليات" },
                { name: "registrations", description: "جدول التسجيلات في الفعاليات" },
                { name: "attendance_records", description: "جدول سجلات الحضور" },
                { name: "event_feedback", description: "جدول تقييمات الفعاليات" }
              ]}
            />
            
            <DatabaseTable 
              title="projects" 
              tables={[
                { name: "projects", description: "جدول المشاريع" },
                { name: "project_activities", description: "جدول أنشطة المشاريع" },
                { name: "project_milestones", description: "جدول مراحل المشاريع" },
                { name: "project_members", description: "جدول أعضاء المشاريع" }
              ]}
            />
            
            <DatabaseTable 
              title="tasks" 
              tables={[
                { name: "tasks", description: "جدول المهام" },
                { name: "task_assignments", description: "جدول تعيينات المهام" },
                { name: "task_comments", description: "جدول تعليقات المهام" },
                { name: "task_attachments", description: "جدول مرفقات المهام" }
              ]}
            />
            
            <DatabaseTable 
              title="portfolios" 
              tables={[
                { name: "portfolios", description: "جدول محافظ المشاريع" },
                { name: "portfolio_projects", description: "جدول مشاريع المحافظ" },
                { name: "workspaces", description: "جدول مساحات العمل" }
              ]}
            />
          </TabsContent>
          
          <TabsContent value="hr" className="space-y-4">
            <div className="text-muted-foreground mb-4">
              <p>جداول نظام الموارد البشرية</p>
            </div>
            
            <DatabaseTable 
              title="employees" 
              tables={[
                { name: "employees", description: "جدول الموظفين" },
                { name: "hr_employee_contracts", description: "جدول عقود الموظفين" },
                { name: "hr_leave_types", description: "جدول أنواع الإجازات" },
                { name: "hr_leave_requests", description: "جدول طلبات الإجازات" },
                { name: "hr_leave_entitlements", description: "جدول استحقاقات الإجازات" }
              ]}
            />
            
            <DatabaseTable 
              title="attendance" 
              tables={[
                { name: "hr_attendance", description: "جدول الحضور والانصراف" },
                { name: "hr_work_schedules", description: "جدول جداول العمل" },
                { name: "hr_work_days", description: "جدول أيام العمل" },
                { name: "hr_shifts", description: "جدول المناوبات" }
              ]}
            />
            
            <DatabaseTable 
              title="organization" 
              tables={[
                { name: "organizational_units", description: "جدول الوحدات التنظيمية" },
                { name: "employee_organizational_units", description: "جدول ارتباط الموظفين بالوحدات" },
                { name: "positions", description: "جدول المناصب الوظيفية" }
              ]}
            />
            
            <DatabaseTable 
              title="training" 
              tables={[
                { name: "hr_training_programs", description: "جدول برامج التدريب" },
                { name: "hr_training_sessions", description: "جدول جلسات التدريب" },
                { name: "hr_training_participants", description: "جدول المشاركين في التدريب" }
              ]}
            />
          </TabsContent>
          
          <TabsContent value="finance" className="space-y-4">
            <div className="text-muted-foreground mb-4">
              <p>جداول النظام المالي والمحاسبي</p>
            </div>
            
            <DatabaseTable 
              title="accounts" 
              tables={[
                { name: "accounting_accounts", description: "جدول الحسابات المحاسبية" },
                { name: "account_types", description: "جدول أنواع الحسابات" },
                { name: "account_balances", description: "جدول أرصدة الحسابات" }
              ]}
            />
            
            <DatabaseTable 
              title="transactions" 
              tables={[
                { name: "accounting_journal_entries", description: "جدول قيود اليومية" },
                { name: "journal_entry_items", description: "جدول بنود قيود اليومية" },
                { name: "accounting_periods", description: "جدول الفترات المحاسبية" }
              ]}
            />
            
            <DatabaseTable 
              title="budget" 
              tables={[
                { name: "budget_items", description: "جدول عناصر الميزانية" },
                { name: "budget_allocations", description: "جدول تخصيصات الميزانية" },
                { name: "expenses", description: "جدول المصروفات" }
              ]}
            />
            
            <DatabaseTable 
              title="resources" 
              tables={[
                { name: "financial_resources", description: "جدول الموارد المالية" },
                { name: "resource_allocations", description: "جدول تخصيص الموارد" },
                { name: "cost_centers", description: "جدول مراكز التكلفة" }
              ]}
            />
          </TabsContent>
          
          <TabsContent value="system" className="space-y-4">
            <div className="text-muted-foreground mb-4">
              <p>جداول إدارة النظام والمستخدمين والأدوار</p>
            </div>
            
            <DatabaseTable 
              title="users" 
              tables={[
                { name: "profiles", description: "جدول ملفات المستخدمين" },
                { name: "auth.users", description: "جدول المستخدمين (Supabase Auth)" }
              ]}
            />
            
            <DatabaseTable 
              title="roles" 
              tables={[
                { name: "roles", description: "جدول الأدوار" },
                { name: "user_roles", description: "جدول أدوار المستخدمين" },
                { name: "permissions", description: "جدول الصلاحيات" },
                { name: "role_permissions", description: "جدول صلاحيات الأدوار" }
              ]}
            />
            
            <DatabaseTable 
              title="settings" 
              tables={[
                { name: "system_settings", description: "جدول إعدادات النظام" },
                { name: "user_settings", description: "جدول إعدادات المستخدمين" },
                { name: "developer_settings", description: "جدول إعدادات المطورين" }
              ]}
            />
            
            <DatabaseTable 
              title="communications" 
              tables={[
                { name: "notifications", description: "جدول الإشعارات" },
                { name: "message_templates", description: "جدول قوالب الرسائل" },
                { name: "whatsapp_messages", description: "جدول رسائل الواتساب" }
              ]}
            />
            
            <DatabaseTable 
              title="meetings" 
              tables={[
                { name: "meetings", description: "جدول الاجتماعات" },
                { name: "meeting_attendees", description: "جدول حضور الاجتماعات" },
                { name: "meeting_minutes", description: "جدول محاضر الاجتماعات" },
                { name: "meeting_decisions", description: "جدول قرارات الاجتماعات" }
              ]}
            />
            
            <DatabaseTable 
              title="requests" 
              tables={[
                { name: "requests", description: "جدول الطلبات" },
                { name: "request_types", description: "جدول أنواع الطلبات" },
                { name: "request_approvals", description: "جدول موافقات الطلبات" },
                { name: "approval_workflows", description: "جدول مسارات الموافقة" }
              ]}
            />
            
            <DatabaseTable 
              title="digital_accounts" 
              tables={[
                { name: "digital_accounts", description: "جدول الحسابات الرقمية" },
                { name: "social_media_posts", description: "جدول منشورات التواصل الاجتماعي" },
                { name: "content_calendar", description: "جدول تقويم المحتوى" }
              ]}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
