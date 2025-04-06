
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
              name="events" 
              description="جدول الأحداث والفعاليات"
              columns={[
                { name: "id", type: "uuid", description: "المعرف الفريد" },
                { name: "title", type: "text", description: "عنوان الفعالية" },
                { name: "description", type: "text", description: "وصف الفعالية" },
                { name: "date", type: "text", description: "تاريخ الفعالية" },
                { name: "time", type: "text", description: "وقت الفعالية" },
                { name: "location", type: "text", description: "موقع الفعالية" },
                { name: "image_url", type: "text", description: "رابط صورة الفعالية" },
                { name: "max_attendees", type: "integer", description: "الحد الأقصى للحضور" },
                { name: "event_category", type: "text", description: "تصنيف الفعالية" },
                { name: "event_path", type: "text", description: "مسار الفعالية" },
                { name: "event_type", type: "text", description: "نوع الفعالية" },
                { name: "beneficiary_type", type: "text", description: "نوع المستفيد" }
              ]}
            />
            
            <DatabaseTable 
              name="registrations" 
              description="جدول التسجيلات في الفعاليات والمشاريع"
              columns={[
                { name: "id", type: "uuid", description: "المعرف الفريد" },
                { name: "event_id", type: "uuid", description: "معرف الفعالية" },
                { name: "project_id", type: "uuid", description: "معرف المشروع" },
                { name: "name", type: "text", description: "اسم المسجل" },
                { name: "email", type: "text", description: "البريد الإلكتروني" },
                { name: "phone", type: "text", description: "رقم الهاتف" },
                { name: "arabic_name", type: "text", description: "الاسم بالعربي" },
                { name: "english_name", type: "text", description: "الاسم بالإنجليزية" },
                { name: "registration_number", type: "text", description: "رقم التسجيل" }
              ]}
            />
            
            <DatabaseTable 
              name="projects" 
              description="جدول المشاريع"
              columns={[
                { name: "id", type: "uuid", description: "المعرف الفريد" },
                { name: "title", type: "text", description: "عنوان المشروع" },
                { name: "description", type: "text", description: "وصف المشروع" },
                { name: "image_url", type: "text", description: "رابط صورة المشروع" },
                { name: "start_date", type: "date", description: "تاريخ بدء المشروع" },
                { name: "end_date", type: "date", description: "تاريخ انتهاء المشروع" },
                { name: "max_attendees", type: "integer", description: "الحد الأقصى للمشاركين" },
                { name: "project_type", type: "text", description: "نوع المشروع" }
              ]}
            />
            
            <DatabaseTable 
              name="project_activities" 
              description="جدول أنشطة المشاريع"
              columns={[
                { name: "id", type: "uuid", description: "المعرف الفريد" },
                { name: "project_id", type: "uuid", description: "معرف المشروع" },
                { name: "title", type: "text", description: "عنوان النشاط" },
                { name: "description", type: "text", description: "وصف النشاط" },
                { name: "date", type: "text", description: "تاريخ النشاط" },
                { name: "time", type: "text", description: "وقت النشاط" },
                { name: "location", type: "text", description: "موقع النشاط" },
                { name: "activity_duration", type: "integer", description: "مدة النشاط" }
              ]}
            />
            
            <DatabaseTable 
              name="attendance_records" 
              description="جدول سجلات الحضور"
              columns={[
                { name: "id", type: "uuid", description: "المعرف الفريد" },
                { name: "event_id", type: "uuid", description: "معرف الفعالية" },
                { name: "project_id", type: "uuid", description: "معرف المشروع" },
                { name: "activity_id", type: "uuid", description: "معرف النشاط" },
                { name: "registration_id", type: "uuid", description: "معرف التسجيل" },
                { name: "check_in_time", type: "timestamp", description: "وقت تسجيل الحضور" },
                { name: "status", type: "text", description: "حالة الحضور" }
              ]}
            />
          </TabsContent>
          
          <TabsContent value="hr" className="space-y-4">
            <div className="text-muted-foreground mb-4">
              <p>جداول نظام الموارد البشرية</p>
            </div>
            
            <DatabaseTable 
              name="employees" 
              description="جدول الموظفين"
              columns={[
                { name: "id", type: "uuid", description: "المعرف الفريد" },
                { name: "user_id", type: "uuid", description: "معرف المستخدم المرتبط" },
                { name: "full_name", type: "text", description: "الاسم الكامل" },
                { name: "email", type: "text", description: "البريد الإلكتروني" },
                { name: "phone", type: "text", description: "رقم الهاتف" },
                { name: "position", type: "text", description: "المنصب الوظيفي" },
                { name: "department", type: "text", description: "القسم" },
                { name: "status", type: "text", description: "حالة الموظف" },
                { name: "hire_date", type: "date", description: "تاريخ التوظيف" },
                { name: "gender", type: "text", description: "الجنس" }
              ]}
            />
            
            <DatabaseTable 
              name="hr_attendance" 
              description="جدول الحضور والانصراف"
              columns={[
                { name: "id", type: "uuid", description: "المعرف الفريد" },
                { name: "employee_id", type: "uuid", description: "معرف الموظف" },
                { name: "attendance_date", type: "date", description: "تاريخ الحضور" },
                { name: "check_in", type: "timestamp", description: "وقت الحضور" },
                { name: "check_out", type: "timestamp", description: "وقت الانصراف" },
                { name: "status", type: "text", description: "حالة الحضور" },
                { name: "is_tardy", type: "boolean", description: "هل الموظف متأخر" },
                { name: "left_early", type: "boolean", description: "هل غادر مبكراً" }
              ]}
            />
            
            <DatabaseTable 
              name="hr_employee_contracts" 
              description="جدول عقود الموظفين"
              columns={[
                { name: "id", type: "uuid", description: "المعرف الفريد" },
                { name: "employee_id", type: "uuid", description: "معرف الموظف" },
                { name: "contract_type", type: "text", description: "نوع العقد" },
                { name: "start_date", type: "date", description: "تاريخ بدء العقد" },
                { name: "end_date", type: "date", description: "تاريخ انتهاء العقد" },
                { name: "probation_end_date", type: "date", description: "تاريخ انتهاء فترة التجربة" },
                { name: "salary", type: "numeric", description: "الراتب" },
                { name: "status", type: "text", description: "حالة العقد" }
              ]}
            />
            
            <DatabaseTable 
              name="hr_leave_requests" 
              description="جدول طلبات الإجازات"
              columns={[
                { name: "id", type: "uuid", description: "المعرف الفريد" },
                { name: "employee_id", type: "uuid", description: "معرف الموظف" },
                { name: "leave_type", type: "text", description: "نوع الإجازة" },
                { name: "start_date", type: "date", description: "تاريخ بدء الإجازة" },
                { name: "end_date", type: "date", description: "تاريخ انتهاء الإجازة" },
                { name: "reason", type: "text", description: "سبب الإجازة" },
                { name: "status", type: "text", description: "حالة طلب الإجازة" }
              ]}
            />
            
            <DatabaseTable 
              name="hr_work_schedule_types" 
              description="جدول أنواع جداول العمل"
              columns={[
                { name: "id", type: "uuid", description: "المعرف الفريد" },
                { name: "name", type: "text", description: "اسم نوع الجدول" },
                { name: "description", type: "text", description: "وصف نوع الجدول" },
                { name: "is_active", type: "boolean", description: "هل الجدول نشط" }
              ]}
            />
          </TabsContent>
          
          <TabsContent value="finance" className="space-y-4">
            <div className="text-muted-foreground mb-4">
              <p>جداول النظام المالي والمحاسبي</p>
            </div>
            
            <DatabaseTable 
              name="accounting_accounts" 
              description="جدول الحسابات المحاسبية"
              columns={[
                { name: "id", type: "uuid", description: "المعرف الفريد" },
                { name: "name", type: "text", description: "اسم الحساب" },
                { name: "code", type: "character varying", description: "كود الحساب" },
                { name: "account_type", type: "text", description: "نوع الحساب" },
                { name: "level", type: "integer", description: "مستوى الحساب" },
                { name: "parent_id", type: "uuid", description: "معرف الحساب الأب" },
                { name: "is_active", type: "boolean", description: "هل الحساب نشط" }
              ]}
            />
            
            <DatabaseTable 
              name="accounting_journal_entries" 
              description="جدول قيود اليومية"
              columns={[
                { name: "id", type: "uuid", description: "المعرف الفريد" },
                { name: "date", type: "date", description: "تاريخ القيد" },
                { name: "description", type: "text", description: "وصف القيد" },
                { name: "status", type: "text", description: "حالة القيد" },
                { name: "total_amount", type: "numeric", description: "إجمالي المبلغ" },
                { name: "created_by", type: "uuid", description: "معرف المنشئ" }
              ]}
            />
            
            <DatabaseTable 
              name="financial_resources" 
              description="جدول الموارد المالية"
              columns={[
                { name: "id", type: "uuid", description: "المعرف الفريد" },
                { name: "entity", type: "text", description: "اسم الجهة" },
                { name: "source", type: "text", description: "مصدر الموارد" },
                { name: "type", type: "text", description: "نوع المورد" },
                { name: "date", type: "date", description: "تاريخ المورد" },
                { name: "total_amount", type: "numeric", description: "إجمالي المبلغ" },
                { name: "net_amount", type: "numeric", description: "صافي المبلغ" }
              ]}
            />
            
            <DatabaseTable 
              name="expenses" 
              description="جدول المصروفات"
              columns={[
                { name: "id", type: "uuid", description: "المعرف الفريد" },
                { name: "budget_item_id", type: "uuid", description: "معرف عنصر الميزانية" },
                { name: "description", type: "text", description: "وصف المصروف" },
                { name: "amount", type: "numeric", description: "مبلغ المصروف" },
                { name: "date", type: "date", description: "تاريخ المصروف" },
                { name: "beneficiary", type: "text", description: "المستفيد" }
              ]}
            />
            
            <DatabaseTable 
              name="budget_items" 
              description="جدول عناصر الميزانية"
              columns={[
                { name: "id", type: "uuid", description: "المعرف الفريد" },
                { name: "name", type: "text", description: "اسم عنصر الميزانية" },
                { name: "default_percentage", type: "numeric", description: "النسبة الافتراضية" }
              ]}
            />
          </TabsContent>
          
          <TabsContent value="system" className="space-y-4">
            <div className="text-muted-foreground mb-4">
              <p>جداول إدارة النظام والمستخدمين والأدوار</p>
            </div>
            
            <DatabaseTable 
              name="profiles" 
              description="جدول ملفات المستخدمين"
              columns={[
                { name: "id", type: "uuid", description: "المعرف الفريد" },
                { name: "email", type: "text", description: "البريد الإلكتروني" },
                { name: "display_name", type: "text", description: "اسم العرض" },
                { name: "is_active", type: "boolean", description: "هل المستخدم نشط" },
                { name: "is_anonymized", type: "boolean", description: "هل المستخدم مجهول" }
              ]}
            />
            
            <DatabaseTable 
              name: "roles",
              description: "جدول الأدوار",
              columns: [
                { name: "id", type: "uuid", description: "المعرف الفريد" },
                { name: "name", type: "text", description: "اسم الدور" },
                { name: "description", type: "text", description: "وصف الدور" }
              ]
            />
            
            <DatabaseTable 
              name: "user_roles",
              description: "جدول أدوار المستخدمين",
              columns: [
                { name: "user_id", type: "uuid", description: "معرف المستخدم" },
                { name: "role_id", type: "uuid", description: "معرف الدور" }
              ]
            />
            
            <DatabaseTable 
              name: "permissions",
              description: "جدول الصلاحيات",
              columns: [
                { name: "id", type: "uuid", description: "المعرف الفريد" },
                { name: "name", type: "text", description: "اسم الصلاحية" },
                { name: "description", type: "text", description: "وصف الصلاحية" },
                { name: "module", type: "text", description: "الوحدة المرتبطة" }
              ]
            />
            
            <DatabaseTable 
              name: "role_permissions",
              description: "جدول صلاحيات الأدوار",
              columns: [
                { name: "role_id", type: "uuid", description: "معرف الدور" },
                { name: "permission_id", type: "uuid", description: "معرف الصلاحية" }
              ]
            />
            
            <DatabaseTable 
              name: "developer_settings",
              description: "جدول إعدادات المطورين",
              columns: [
                { name: "id", type: "uuid", description: "المعرف الفريد" },
                { name: "user_id", type: "uuid", description: "معرف المستخدم" },
                { name: "is_enabled", type: "boolean", description: "هل مفعلة" },
                { name: "debug_level", type: "text", description: "مستوى التصحيح" },
                { name: "cache_time_minutes", type: "integer", description: "وقت التخزين المؤقت بالدقائق" },
                { name: "update_interval_seconds", type: "integer", description: "فترة التحديث بالثواني" },
                { name: "show_toolbar", type: "boolean", description: "هل يظهر شريط أدوات المطور" }
              ]
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
