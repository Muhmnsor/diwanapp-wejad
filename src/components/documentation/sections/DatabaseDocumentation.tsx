
import { Accordion } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeBlock } from "../components/CodeBlock";
import { DatabaseTable } from "../components/DatabaseTable";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

export const DatabaseDocumentation = () => {
  const hrLeaveTypesSql = `-- Table for HR leave types
CREATE TABLE IF NOT EXISTS hr_leave_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  max_days INTEGER,
  is_paid BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  requires_approval BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`;

  const hrWorkSchedulesSql = `-- Create hr_work_schedules table
CREATE TABLE hr_work_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  work_hours_per_day NUMERIC(4,2) NOT NULL,
  work_days_per_week SMALLINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);`;

  const permissionsSql = `-- Create permissions table
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  module TEXT NOT NULL,
  category TEXT,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(module, name)
);`;

  const requestsDeleteFunctionSql = `-- تحديث دالة حذف أنواع الطلبات للتعامل مع خطوات سير العمل والعلاقات بشكل صحيح
CREATE OR REPLACE FUNCTION public.delete_request_type(p_request_type_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_is_admin boolean;
  v_result jsonb;
  v_related_requests int;
  v_workflow_ids uuid[];
  v_default_workflow_id uuid;
BEGIN
  -- التحقق من صلاحيات المستخدم
  SELECT EXISTS (
    SELECT 1 
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
    AND (r.name IN ('admin', 'app_admin', 'developer'))
  ) INTO v_is_admin;
  
  -- Additional complex SQL code omitted for brevity
  -- ...
  
  RETURN v_result;
END;
$function$;`;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>قاعدة البيانات</CardTitle>
          <CardDescription>
            توثيق هيكل قاعدة البيانات، الجداول، والعلاقات
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="structure">
            <TabsList className="mb-4">
              <TabsTrigger value="structure">هيكل البيانات</TabsTrigger>
              <TabsTrigger value="tables">الجداول</TabsTrigger>
              <TabsTrigger value="relations">العلاقات</TabsTrigger>
              <TabsTrigger value="functions">الوظائف</TabsTrigger>
              <TabsTrigger value="sql">أمثلة SQL</TabsTrigger>
            </TabsList>

            <TabsContent value="structure" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>نظرة عامة على هيكل البيانات</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    نظام قاعدة البيانات مبني على Postgres مع Supabase، ويتكون من عدة مجموعات رئيسية من الجداول:
                  </p>
                  
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>الأساسية:</strong> المستخدمين، الأدوار، الصلاحيات، الإشعارات</li>
                    <li><strong>النظام الإداري:</strong> الأقسام، الهيكل التنظيمي، المستندات</li>
                    <li><strong>نظام الموارد البشرية:</strong> الموظفين، الإجازات، العقود، الجداول، الحضور</li>
                    <li><strong>نظام الفعاليات:</strong> الفعاليات، التسجيل، الحضور، التقييمات، الشهادات</li>
                    <li><strong>نظام المشاريع:</strong> المشاريع، النشاطات، التقارير</li>
                    <li><strong>نظام المهام:</strong> المهام، الأنشطة، التعليقات، المرفقات</li>
                    <li><strong>نظام الطلبات:</strong> أنواع الطلبات، سير العمل، خطوات الموافقة، المرفقات</li>
                    <li><strong>النظام المالي:</strong> الموارد المالية، المصروفات، الالتزامات، المحاسبة</li>
                    <li><strong>نظام الاجتماعات:</strong> الاجتماعات، المشاركين، المحاضر، الأجندة، المهام</li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>ميزات قاعدة البيانات</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">أمان البيانات</h3>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>سياسات أمنية على مستوى الصف (RLS)</li>
                        <li>وظائف SECURITY DEFINER للتحقق من الصلاحيات</li>
                        <li>أدوار المستخدمين وتصاريح قوية</li>
                        <li>تشفير البيانات الحساسة</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-lg mb-2">التكامل والاتساق</h3>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>مفاتيح خارجية وقيود للحفاظ على سلامة البيانات</li>
                        <li>محفزات (Triggers) للتحديث التلقائي</li>
                        <li>وظائف (Functions) لضمان تناسق العمليات</li>
                        <li>معاملات (Transactions) للعمليات المعقدة</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tables" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DatabaseTable 
                  title="نظام المستخدمين والصلاحيات"
                  tables={[
                    { name: "profiles", description: "بيانات المستخدمين الأساسية" },
                    { name: "roles", description: "الأدوار المتاحة في النظام" },
                    { name: "user_roles", description: "علاقة بين المستخدمين والأدوار" },
                    { name: "permissions", description: "الصلاحيات المتاحة" },
                    { name: "role_permissions", description: "صلاحيات كل دور" },
                    { name: "app_permissions", description: "صلاحيات الوصول للتطبيقات" }
                  ]}
                />
                
                <DatabaseTable 
                  title="نظام الموارد البشرية"
                  tables={[
                    { name: "employees", description: "بيانات الموظفين" },
                    { name: "hr_leave_types", description: "أنواع الإجازات" },
                    { name: "hr_leave_requests", description: "طلبات الإجازات" },
                    { name: "hr_leave_entitlements", description: "استحقاقات الإجازات" },
                    { name: "hr_attendance", description: "سجلات الحضور والانصراف" },
                    { name: "hr_work_schedules", description: "جداول العمل" },
                    { name: "hr_work_days", description: "أيام العمل في كل جدول" },
                    { name: "hr_employee_contracts", description: "عقود الموظفين" },
                    { name: "organizational_units", description: "الوحدات التنظيمية" }
                  ]}
                />
                
                <DatabaseTable 
                  title="نظام الفعاليات"
                  tables={[
                    { name: "events", description: "الفعاليات والبرامج" },
                    { name: "registrations", description: "التسجيلات في الفعاليات" },
                    { name: "event_feedback", description: "تقييمات المشاركين للفعاليات" },
                    { name: "attendance_records", description: "سجلات الحضور للفعاليات" },
                    { name: "certificates", description: "الشهادات الممنوحة للمشاركين" },
                    { name: "event_reports", description: "تقارير الفعاليات" }
                  ]}
                />
                
                <DatabaseTable 
                  title="نظام المشاريع"
                  tables={[
                    { name: "projects", description: "المشاريع البرامجية" },
                    { name: "project_activities", description: "أنشطة المشاريع" },
                    { name: "project_stages", description: "مراحل المشاريع" },
                    { name: "project_activity_reports", description: "تقارير أنشطة المشاريع" }
                  ]}
                />
                
                <DatabaseTable 
                  title="نظام المهام"
                  tables={[
                    { name: "tasks", description: "المهام العامة" },
                    { name: "project_tasks", description: "مشاريع المهام" },
                    { name: "subtasks", description: "المهام الفرعية" },
                    { name: "task_comments", description: "تعليقات المهام" },
                    { name: "task_attachments", description: "مرفقات المهام" },
                    { name: "task_deliverables", description: "مخرجات المهام" },
                    { name: "task_dependencies", description: "اعتماديات المهام" },
                    { name: "task_history", description: "سجل تغييرات المهام" }
                  ]}
                />
                
                <DatabaseTable 
                  title="نظام الطلبات"
                  tables={[
                    { name: "request_types", description: "أنواع الطلبات" },
                    { name: "requests", description: "الطلبات المقدمة" },
                    { name: "request_workflows", description: "مسارات سير العمل" },
                    { name: "workflow_steps", description: "خطوات سير العمل" },
                    { name: "request_approvals", description: "موافقات الطلبات" },
                    { name: "request_attachments", description: "مرفقات الطلبات" },
                    { name: "request_approval_logs", description: "سجلات الموافقات" }
                  ]}
                />
                
                <DatabaseTable 
                  title="النظام المالي"
                  tables={[
                    { name: "financial_resources", description: "الموارد المالية" },
                    { name: "expenses", description: "المصروفات" },
                    { name: "budget_items", description: "عناصر الميزانية" },
                    { name: "financial_targets", description: "المستهدفات المالية" },
                    { name: "resource_obligations", description: "الالتزامات على الموارد" },
                    { name: "accounting_accounts", description: "الحسابات المحاسبية" },
                    { name: "accounting_journal_entries", description: "قيود اليومية" },
                    { name: "accounting_journal_items", description: "بنود قيود اليومية" },
                    { name: "accounting_periods", description: "الفترات المحاسبية" },
                    { name: "accounting_cost_centers", description: "مراكز التكلفة" }
                  ]}
                />
                
                <DatabaseTable 
                  title="نظام الاجتماعات"
                  tables={[
                    { name: "meetings", description: "الاجتماعات" },
                    { name: "meeting_folders", description: "مجلدات الاجتماعات" },
                    { name: "meeting_participants", description: "المشاركون في الاجتماعات" },
                    { name: "meeting_agenda_items", description: "بنود أجندة الاجتماع" },
                    { name: "meeting_minutes", description: "محاضر الاجتماعات" },
                    { name: "meeting_tasks", description: "مهام الاجتماعات" },
                    { name: "meeting_objectives", description: "أهداف الاجتماعات" }
                  ]}
                />
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>تفاصيل هيكل الجداول</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] rounded-md border p-4">
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold text-lg mb-2">جدول hr_leave_types</h3>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>العمود</TableHead>
                              <TableHead>النوع</TableHead>
                              <TableHead>الوصف</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell className="font-mono">id</TableCell>
                              <TableCell>UUID</TableCell>
                              <TableCell>معرف فريد</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-mono">code</TableCell>
                              <TableCell>VARCHAR(50)</TableCell>
                              <TableCell>رمز نوع الإجازة (فريد)</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-mono">name</TableCell>
                              <TableCell>VARCHAR(100)</TableCell>
                              <TableCell>اسم نوع الإجازة</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-mono">description</TableCell>
                              <TableCell>TEXT</TableCell>
                              <TableCell>وصف نوع الإجازة</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-mono">max_days</TableCell>
                              <TableCell>INTEGER</TableCell>
                              <TableCell>الحد الأقصى لعدد أيام الإجازة</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-mono">is_paid</TableCell>
                              <TableCell>BOOLEAN</TableCell>
                              <TableCell>هل الإجازة مدفوعة؟</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-mono">is_active</TableCell>
                              <TableCell>BOOLEAN</TableCell>
                              <TableCell>هل نوع الإجازة مفعل؟</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-mono">requires_approval</TableCell>
                              <TableCell>BOOLEAN</TableCell>
                              <TableCell>هل تتطلب الإجازة موافقة؟</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-mono">created_at</TableCell>
                              <TableCell>TIMESTAMP</TableCell>
                              <TableCell>تاريخ الإنشاء</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-mono">updated_at</TableCell>
                              <TableCell>TIMESTAMP</TableCell>
                              <TableCell>تاريخ التحديث</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg mb-2">جدول requests</h3>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>العمود</TableHead>
                              <TableHead>النوع</TableHead>
                              <TableHead>الوصف</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell className="font-mono">id</TableCell>
                              <TableCell>UUID</TableCell>
                              <TableCell>معرف فريد</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-mono">title</TableCell>
                              <TableCell>TEXT</TableCell>
                              <TableCell>عنوان الطلب</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-mono">requester_id</TableCell>
                              <TableCell>UUID</TableCell>
                              <TableCell>معرف مقدم الطلب</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-mono">request_type_id</TableCell>
                              <TableCell>UUID</TableCell>
                              <TableCell>نوع الطلب</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-mono">workflow_id</TableCell>
                              <TableCell>UUID</TableCell>
                              <TableCell>مسار سير العمل</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-mono">current_step_id</TableCell>
                              <TableCell>UUID</TableCell>
                              <TableCell>الخطوة الحالية</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-mono">form_data</TableCell>
                              <TableCell>JSONB</TableCell>
                              <TableCell>بيانات النموذج</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-mono">status</TableCell>
                              <TableCell>TEXT</TableCell>
                              <TableCell>حالة الطلب</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-mono">priority</TableCell>
                              <TableCell>TEXT</TableCell>
                              <TableCell>الأولوية</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-mono">created_at</TableCell>
                              <TableCell>TIMESTAMP</TableCell>
                              <TableCell>تاريخ الإنشاء</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-mono">updated_at</TableCell>
                              <TableCell>TIMESTAMP</TableCell>
                              <TableCell>تاريخ التحديث</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="relations" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>العلاقات بين الجداول</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] rounded-md border p-4">
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold text-lg mb-2">نظام الطلبات</h3>
                        <ul className="list-disc pl-6 space-y-1">
                          <li><code>requests.requester_id</code> → <code>profiles.id</code></li>
                          <li><code>requests.request_type_id</code> → <code>request_types.id</code></li>
                          <li><code>requests.workflow_id</code> → <code>request_workflows.id</code></li>
                          <li><code>requests.current_step_id</code> → <code>workflow_steps.id</code></li>
                          <li><code>request_approvals.request_id</code> → <code>requests.id</code></li>
                          <li><code>request_approvals.step_id</code> → <code>workflow_steps.id</code></li>
                          <li><code>request_approvals.approver_id</code> → <code>profiles.id</code></li>
                          <li><code>request_attachments.request_id</code> → <code>requests.id</code></li>
                          <li><code>workflow_steps.workflow_id</code> → <code>request_workflows.id</code></li>
                          <li><code>request_workflows.request_type_id</code> → <code>request_types.id</code></li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg mb-2">نظام الموارد البشرية</h3>
                        <ul className="list-disc pl-6 space-y-1">
                          <li><code>hr_leave_requests.employee_id</code> → <code>employees.id</code></li>
                          <li><code>hr_leave_entitlements.employee_id</code> → <code>employees.id</code></li>
                          <li><code>hr_leave_entitlements.leave_type_id</code> → <code>hr_leave_types.id</code></li>
                          <li><code>hr_attendance.employee_id</code> → <code>employees.id</code></li>
                          <li><code>hr_work_days.schedule_id</code> → <code>hr_work_schedules.id</code></li>
                          <li><code>hr_employee_contracts.employee_id</code> → <code>employees.id</code></li>
                          <li><code>employees.schedule_id</code> → <code>hr_work_schedules.id</code></li>
                          <li><code>employees.user_id</code> → <code>profiles.id</code></li>
                          <li><code>organizational_units.parent_id</code> → <code>organizational_units.id</code></li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg mb-2">نظام الفعاليات والمشاريع</h3>
                        <ul className="list-disc pl-6 space-y-1">
                          <li><code>registrations.event_id</code> → <code>events.id</code></li>
                          <li><code>registrations.project_id</code> → <code>projects.id</code></li>
                          <li><code>registrations.user_id</code> → <code>profiles.id</code></li>
                          <li><code>attendance_records.event_id</code> → <code>events.id</code></li>
                          <li><code>attendance_records.registration_id</code> → <code>registrations.id</code></li>
                          <li><code>certificates.registration_id</code> → <code>registrations.id</code></li>
                          <li><code>certificates.event_id</code> → <code>events.id</code></li>
                          <li><code>event_feedback.event_id</code> → <code>events.id</code></li>
                          <li><code>project_activities.project_id</code> → <code>projects.id</code></li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg mb-2">نظام المهام</h3>
                        <ul className="list-disc pl-6 space-y-1">
                          <li><code>tasks.workspace_id</code> → <code>workspaces.id</code></li>
                          <li><code>tasks.project_id</code> → <code>project_tasks.id</code></li>
                          <li><code>tasks.stage_id</code> → <code>project_stages.id</code></li>
                          <li><code>tasks.assigned_to</code> → <code>profiles.id</code></li>
                          <li><code>tasks.created_by</code> → <code>profiles.id</code></li>
                          <li><code>subtasks.task_id</code> → <code>tasks.id</code></li>
                          <li><code>task_comments.task_id</code> → <code>tasks.id</code></li>
                          <li><code>task_attachments.task_id</code> → <code>tasks.id</code></li>
                        </ul>
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="functions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>الوظائف المهمة في قاعدة البيانات</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] rounded-md border p-4">
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold text-lg mb-2">وظائف التحقق من الصلاحيات</h3>
                        <ul className="list-disc pl-6 space-y-2">
                          <li>
                            <div className="font-mono text-sm mb-1">check_user_app_access(user_id, app_name)</div>
                            <p>التحقق من صلاحية المستخدم للوصول إلى تطبيق معين</p>
                          </li>
                          <li>
                            <div className="font-mono text-sm mb-1">check_user_permission(user_id, app_name, permission)</div>
                            <p>التحقق من صلاحية محددة للمستخدم</p>
                          </li>
                          <li>
                            <div className="font-mono text-sm mb-1">is_admin()</div>
                            <p>التحقق مما إذا كان المستخدم الحالي مشرفًا</p>
                          </li>
                          <li>
                            <div className="font-mono text-sm mb-1">is_developer(user_id)</div>
                            <p>التحقق مما إذا كان المستخدم مطورًا</p>
                          </li>
                          <li>
                            <div className="font-mono text-sm mb-1">has_hr_access(user_id)</div>
                            <p>التحقق من صلاحيات الموارد البشرية</p>
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg mb-2">وظائف نظام الطلبات</h3>
                        <ul className="list-disc pl-6 space-y-2">
                          <li>
                            <div className="font-mono text-sm mb-1">approve_request(request_id, step_id, comments)</div>
                            <p>الموافقة على طلب في خطوة معينة</p>
                          </li>
                          <li>
                            <div className="font-mono text-sm mb-1">reject_request(request_id, step_id, comments)</div>
                            <p>رفض طلب في خطوة معينة</p>
                          </li>
                          <li>
                            <div className="font-mono text-sm mb-1">delete_request(request_id)</div>
                            <p>حذف طلب وجميع البيانات المرتبطة به</p>
                          </li>
                          <li>
                            <div className="font-mono text-sm mb-1">delete_request_type(request_type_id)</div>
                            <p>حذف نوع طلب وسير العمل المرتبط به</p>
                          </li>
                          <li>
                            <div className="font-mono text-sm mb-1">get_request_statistics()</div>
                            <p>الحصول على إحصائيات الطلبات</p>
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg mb-2">وظائف الموارد البشرية</h3>
                        <ul className="list-disc pl-6 space-y-2">
                          <li>
                            <div className="font-mono text-sm mb-1">record_employee_attendance(action, employee_id)</div>
                            <p>تسجيل حضور أو انصراف موظف</p>
                          </li>
                          <li>
                            <div className="font-mono text-sm mb-1">mark_absent_employees(date)</div>
                            <p>تسجيل غياب الموظفين تلقائيًا</p>
                          </li>
                          <li>
                            <div className="font-mono text-sm mb-1">calculate_leave_balance(employee_id, leave_type_id, year)</div>
                            <p>حساب رصيد الإجازات للموظف</p>
                          </li>
                          <li>
                            <div className="font-mono text-sm mb-1">get_organizational_hierarchy()</div>
                            <p>الحصول على الهيكل التنظيمي كاملاً</p>
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg mb-2">أنواع المحفزات (Triggers)</h3>
                        <ul className="list-disc pl-6 space-y-2">
                          <li>
                            <div className="font-mono text-sm mb-1">handle_new_user</div>
                            <p>إنشاء سجل جديد في profiles عند تسجيل مستخدم جديد</p>
                          </li>
                          <li>
                            <div className="font-mono text-sm mb-1">handle_updated_at</div>
                            <p>تحديث حقل updated_at عند تعديل السجل</p>
                          </li>
                          <li>
                            <div className="font-mono text-sm mb-1">handle_task_changes</div>
                            <p>تسجيل تغييرات المهام في سجل التاريخ</p>
                          </li>
                          <li>
                            <div className="font-mono text-sm mb-1">sync_app_permissions_trigger</div>
                            <p>مزامنة صلاحيات التطبيقات مع صلاحيات الأدوار</p>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sql">
              <Card>
                <CardHeader>
                  <CardTitle>أمثلة على بنية الجداول</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">جدول أنواع الإجازات</h3>
                    <CodeBlock code={hrLeaveTypesSql} language="sql" />
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-lg mb-2">جدول جداول العمل</h3>
                    <CodeBlock code={hrWorkSchedulesSql} language="sql" />
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-2">جدول الصلاحيات</h3>
                    <CodeBlock code={permissionsSql} language="sql" />
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-2">دالة حذف أنواع الطلبات</h3>
                    <CodeBlock code={requestsDeleteFunctionSql} language="sql" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
