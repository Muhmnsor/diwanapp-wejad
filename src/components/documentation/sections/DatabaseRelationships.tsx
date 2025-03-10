
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CodeBlock } from "../components/CodeBlock";

interface RelationshipInfo {
  sourceTable: string;
  sourceColumn: string;
  targetTable: string;
  targetColumn: string;
  relationType: string;
  description: string;
}

interface RelationshipGroupProps {
  title: string;
  description: string;
  relationships: RelationshipInfo[];
}

const RelationshipGroup = ({ title, description, relationships }: RelationshipGroupProps) => {
  return (
    <Accordion type="single" collapsible className="w-full mb-6">
      <AccordionItem value={title.replace(/\s/g, "-")}>
        <AccordionTrigger>{title}</AccordionTrigger>
        <AccordionContent>
          <p className="mb-4 text-sm text-muted-foreground">{description}</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الجدول المصدر</TableHead>
                <TableHead>العمود المصدر</TableHead>
                <TableHead>نوع العلاقة</TableHead>
                <TableHead>الجدول الهدف</TableHead>
                <TableHead>العمود الهدف</TableHead>
                <TableHead>الوصف</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {relationships.map((rel, index) => (
                <TableRow key={index}>
                  <TableCell className="font-mono text-sm">{rel.sourceTable}</TableCell>
                  <TableCell className="font-mono text-sm">{rel.sourceColumn}</TableCell>
                  <TableCell>{rel.relationType}</TableCell>
                  <TableCell className="font-mono text-sm">{rel.targetTable}</TableCell>
                  <TableCell className="font-mono text-sm">{rel.targetColumn}</TableCell>
                  <TableCell>{rel.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export const DatabaseRelationships = () => {
  const userRelationships: RelationshipInfo[] = [
    {
      sourceTable: "profiles",
      sourceColumn: "id",
      targetTable: "user_roles",
      targetColumn: "user_id",
      relationType: "1:n",
      description: "علاقة المستخدم بأدواره في النظام"
    },
    {
      sourceTable: "user_roles",
      sourceColumn: "role_id",
      targetTable: "roles",
      targetColumn: "id",
      relationType: "n:1",
      description: "علاقة الدور بالمستخدمين"
    },
    {
      sourceTable: "roles",
      sourceColumn: "id",
      targetTable: "role_permissions",
      targetColumn: "role_id",
      relationType: "1:n",
      description: "علاقة الدور بالصلاحيات المرتبطة به"
    },
    {
      sourceTable: "role_permissions",
      sourceColumn: "permission_id",
      targetTable: "permissions",
      targetColumn: "id",
      relationType: "n:1",
      description: "علاقة الصلاحية بالأدوار المرتبطة بها"
    },
    {
      sourceTable: "profiles",
      sourceColumn: "id",
      targetTable: "user_settings",
      targetColumn: "user_id",
      relationType: "1:1",
      description: "إعدادات المستخدم الشخصية"
    },
    {
      sourceTable: "profiles",
      sourceColumn: "id",
      targetTable: "user_notification_preferences",
      targetColumn: "user_id",
      relationType: "1:1",
      description: "تفضيلات الإشعارات للمستخدم"
    },
    {
      sourceTable: "profiles",
      sourceColumn: "id",
      targetTable: "developer_permissions",
      targetColumn: "user_id",
      relationType: "1:1",
      description: "صلاحيات المطور (للمستخدمين المطورين فقط)"
    }
  ];

  const eventProjectRelationships: RelationshipInfo[] = [
    {
      sourceTable: "events",
      sourceColumn: "id",
      targetTable: "registrations",
      targetColumn: "event_id",
      relationType: "1:n",
      description: "تسجيلات الأشخاص في الفعالية"
    },
    {
      sourceTable: "events",
      sourceColumn: "id",
      targetTable: "attendance_records",
      targetColumn: "event_id",
      relationType: "1:n",
      description: "سجلات حضور الفعالية"
    },
    {
      sourceTable: "events",
      sourceColumn: "id",
      targetTable: "event_feedback",
      targetColumn: "event_id",
      relationType: "1:n",
      description: "تقييمات الفعالية"
    },
    {
      sourceTable: "events",
      sourceColumn: "id",
      targetTable: "event_reports",
      targetColumn: "event_id",
      relationType: "1:n",
      description: "تقارير الفعالية"
    },
    {
      sourceTable: "events",
      sourceColumn: "id",
      targetTable: "event_registration_fields",
      targetColumn: "event_id",
      relationType: "1:1",
      description: "حقول تسجيل الفعالية"
    },
    {
      sourceTable: "events",
      sourceColumn: "id",
      targetTable: "event_notification_settings",
      targetColumn: "event_id",
      relationType: "1:1",
      description: "إعدادات إشعارات الفعالية"
    },
    {
      sourceTable: "projects",
      sourceColumn: "id",
      targetTable: "project_activities",
      targetColumn: "project_id",
      relationType: "1:n",
      description: "أنشطة المشروع"
    },
    {
      sourceTable: "events",
      sourceColumn: "project_id",
      targetTable: "projects",
      targetColumn: "id",
      relationType: "n:1",
      description: "الفعاليات المرتبطة بمشروع معين"
    },
    {
      sourceTable: "project_activities",
      sourceColumn: "id",
      targetTable: "activity_feedback",
      targetColumn: "project_activity_id",
      relationType: "1:n",
      description: "تقييمات نشاط المشروع"
    }
  ];

  const taskRelationships: RelationshipInfo[] = [
    {
      sourceTable: "tasks",
      sourceColumn: "id",
      targetTable: "subtasks",
      targetColumn: "task_id",
      relationType: "1:n",
      description: "المهام الفرعية ضمن مهمة رئيسية"
    },
    {
      sourceTable: "tasks",
      sourceColumn: "id",
      targetTable: "task_comments",
      targetColumn: "task_id",
      relationType: "1:n",
      description: "تعليقات على المهمة"
    },
    {
      sourceTable: "tasks",
      sourceColumn: "id",
      targetTable: "task_attachments",
      targetColumn: "task_id",
      relationType: "1:n",
      description: "مرفقات المهمة"
    },
    {
      sourceTable: "tasks",
      sourceColumn: "id",
      targetTable: "task_history",
      targetColumn: "task_id",
      relationType: "1:n",
      description: "سجل تغييرات المهمة"
    },
    {
      sourceTable: "tasks",
      sourceColumn: "id",
      targetTable: "task_dependencies",
      targetColumn: "task_id",
      relationType: "1:n",
      description: "اعتماديات المهمة (المهام التي تعتمد على هذه المهمة)"
    },
    {
      sourceTable: "tasks",
      sourceColumn: "id",
      targetTable: "task_dependencies",
      targetColumn: "dependency_task_id",
      relationType: "1:n",
      description: "المهام التي تعتمد عليها هذه المهمة"
    },
    {
      sourceTable: "tasks",
      sourceColumn: "workspace_id",
      targetTable: "workspaces",
      targetColumn: "id",
      relationType: "n:1",
      description: "مساحة العمل التي تنتمي إليها المهمة"
    },
    {
      sourceTable: "tasks",
      sourceColumn: "project_id",
      targetTable: "project_tasks",
      targetColumn: "id",
      relationType: "n:1",
      description: "المشروع الذي تنتمي إليه المهمة"
    },
    {
      sourceTable: "tasks",
      sourceColumn: "stage_id",
      targetTable: "project_stages",
      targetColumn: "id",
      relationType: "n:1",
      description: "مرحلة المشروع التي تنتمي إليها المهمة"
    }
  ];

  const requestRelationships: RelationshipInfo[] = [
    {
      sourceTable: "requests",
      sourceColumn: "request_type_id",
      targetTable: "request_types",
      targetColumn: "id",
      relationType: "n:1",
      description: "نوع الطلب"
    },
    {
      sourceTable: "requests",
      sourceColumn: "workflow_id",
      targetTable: "request_workflows",
      targetColumn: "id",
      relationType: "n:1",
      description: "سير عمل الطلب"
    },
    {
      sourceTable: "requests",
      sourceColumn: "current_step_id",
      targetTable: "workflow_steps",
      targetColumn: "id",
      relationType: "n:1",
      description: "الخطوة الحالية في سير العمل"
    },
    {
      sourceTable: "request_workflows",
      sourceColumn: "id",
      targetTable: "workflow_steps",
      targetColumn: "workflow_id",
      relationType: "1:n",
      description: "خطوات سير العمل"
    },
    {
      sourceTable: "requests",
      sourceColumn: "id",
      targetTable: "request_approvals",
      targetColumn: "request_id",
      relationType: "1:n",
      description: "موافقات الطلب"
    },
    {
      sourceTable: "requests",
      sourceColumn: "id",
      targetTable: "request_attachments",
      targetColumn: "request_id",
      relationType: "1:n",
      description: "مرفقات الطلب"
    },
    {
      sourceTable: "request_types",
      sourceColumn: "id",
      targetTable: "request_workflows",
      targetColumn: "request_type_id",
      relationType: "1:n",
      description: "مسارات العمل المرتبطة بنوع طلب معين"
    }
  ];

  const financialRelationships: RelationshipInfo[] = [
    {
      sourceTable: "financial_resources",
      sourceColumn: "id",
      targetTable: "resource_distributions",
      targetColumn: "resource_id",
      relationType: "1:n",
      description: "توزيعات المورد المالي على بنود الميزانية"
    },
    {
      sourceTable: "financial_resources",
      sourceColumn: "id",
      targetTable: "resource_obligations",
      targetColumn: "resource_id",
      relationType: "1:n",
      description: "الالتزامات المرتبطة بالمورد المالي"
    },
    {
      sourceTable: "resource_distributions",
      sourceColumn: "budget_item_id",
      targetTable: "budget_items",
      targetColumn: "id",
      relationType: "n:1",
      description: "بند الميزانية المخصص له جزء من المورد"
    },
    {
      sourceTable: "expenses",
      sourceColumn: "budget_item_id",
      targetTable: "budget_items",
      targetColumn: "id",
      relationType: "n:1",
      description: "بند الميزانية الذي يندرج تحته المصروف"
    },
    {
      sourceTable: "financial_targets",
      sourceColumn: "budget_item_id",
      targetTable: "budget_items",
      targetColumn: "id",
      relationType: "n:1",
      description: "بند الميزانية المرتبط بالهدف المالي"
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>علاقات قاعدة البيانات</CardTitle>
          <CardDescription>
            توثيق العلاقات بين جداول قاعدة البيانات والمفاتيح الأجنبية والاعتماديات
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">مقدمة عن العلاقات في قاعدة البيانات</h3>
              <p className="text-sm text-muted-foreground mb-4">
                تحتوي قاعدة البيانات على عدة مجموعات من الجداول المرتبطة ببعضها. يوضح هذا القسم العلاقات الرئيسية بين هذه الجداول وكيفية استخدامها.
              </p>
              <div className="mb-4">
                <h4 className="text-md font-semibold mb-2">أنواع العلاقات:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><span className="font-semibold">1:1 (واحد لواحد)</span> - كل سجل في الجدول الأول مرتبط بسجل واحد فقط في الجدول الثاني</li>
                  <li><span className="font-semibold">1:n (واحد لكثير)</span> - كل سجل في الجدول الأول مرتبط بعدة سجلات في الجدول الثاني</li>
                  <li><span className="font-semibold">n:1 (كثير لواحد)</span> - عدة سجلات في الجدول الأول مرتبطة بسجل واحد في الجدول الثاني</li>
                  <li><span className="font-semibold">n:m (كثير لكثير)</span> - عدة سجلات في الجدول الأول مرتبطة بعدة سجلات في الجدول الثاني (عادة عبر جدول وسيط)</li>
                </ul>
              </div>

              <h4 className="text-md font-semibold mb-2">مثال على استعلام للعلاقات:</h4>
              <CodeBlock 
                code={`-- مثال على استعلام يستخدم العلاقات بين الجداول
SELECT 
  e.title as event_title,
  COUNT(r.id) as registrations_count,
  COUNT(a.id) as attendees_count
FROM 
  events e
LEFT JOIN 
  registrations r ON e.id = r.event_id
LEFT JOIN 
  attendance_records a ON e.id = a.event_id AND a.status = 'present'
WHERE 
  e.date >= CURRENT_DATE
GROUP BY 
  e.id, e.title
ORDER BY 
  e.date ASC;`} 
                language="sql" 
              />
            </div>
            
            <h3 className="text-lg font-semibold">مجموعات العلاقات الرئيسية:</h3>

            <RelationshipGroup 
              title="علاقات المستخدمين والأدوار والصلاحيات" 
              description="تصف هذه العلاقات الروابط بين جداول المستخدمين وأدوارهم وصلاحياتهم وإعداداتهم."
              relationships={userRelationships}
            />

            <RelationshipGroup 
              title="علاقات الفعاليات والمشاريع" 
              description="تصف هذه العلاقات الروابط بين الفعاليات والمشاريع والتسجيلات والحضور والتقييمات."
              relationships={eventProjectRelationships}
            />

            <RelationshipGroup 
              title="علاقات المهام وإدارة المشاريع" 
              description="تصف هذه العلاقات المهام وارتباطها بالمهام الفرعية ومساحات العمل والمراحل والتعليقات."
              relationships={taskRelationships}
            />

            <RelationshipGroup 
              title="علاقات الطلبات وسير العمل" 
              description="تصف هذه العلاقات نظام الطلبات الإلكترونية وسير العمل والموافقات وخطوات المعالجة."
              relationships={requestRelationships}
            />

            <RelationshipGroup 
              title="علاقات الموارد المالية" 
              description="تصف هذه العلاقات الموارد المالية وتوزيعها على بنود الميزانية والمصروفات والأهداف المالية."
              relationships={financialRelationships}
            />

            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">نصائح للاستعلامات متعددة الجداول</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-md font-semibold mb-2">1. استخدام الـ JOIN المناسب:</h4>
                  <CodeBlock 
                    code={`-- للحصول على المهام مع مهامها الفرعية
SELECT 
  t.id, t.title, t.status,
  s.id as subtask_id, s.title as subtask_title, s.status as subtask_status
FROM 
  tasks t
LEFT JOIN 
  subtasks s ON t.id = s.task_id
WHERE 
  t.workspace_id = '00000000-0000-0000-0000-000000000000';`} 
                    language="sql" 
                  />
                </div>

                <div>
                  <h4 className="text-md font-semibold mb-2">2. الاستعلامات المعقدة متعددة الجداول:</h4>
                  <CodeBlock 
                    code={`-- الحصول على تفاصيل الطلب مع الموافقات والخطوات
SELECT 
  r.id, r.title, r.status,
  rt.name as request_type,
  ws.step_name as current_step,
  p.display_name as requester_name,
  ARRAY_AGG(ra.status) as approval_statuses
FROM 
  requests r
JOIN 
  request_types rt ON r.request_type_id = rt.id
JOIN 
  workflow_steps ws ON r.current_step_id = ws.id
JOIN 
  profiles p ON r.requester_id = p.id
LEFT JOIN 
  request_approvals ra ON r.id = ra.request_id
WHERE 
  r.id = '00000000-0000-0000-0000-000000000000'
GROUP BY 
  r.id, r.title, r.status, rt.name, ws.step_name, p.display_name;`} 
                    language="sql" 
                  />
                </div>

                <div>
                  <h4 className="text-md font-semibold mb-2">3. استخدام CTE للاستعلامات المعقدة:</h4>
                  <CodeBlock 
                    code={`-- الحصول على إحصائيات المشروع باستخدام CTE
WITH project_stats AS (
  SELECT 
    p.id as project_id,
    COUNT(t.id) as total_tasks,
    COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks
  FROM 
    projects p
  LEFT JOIN 
    tasks t ON t.project_id::uuid = p.id
  GROUP BY 
    p.id
),
activity_stats AS (
  SELECT 
    pa.project_id,
    COUNT(pa.id) as total_activities,
    SUM(pa.activity_duration) as total_hours
  FROM 
    project_activities pa
  GROUP BY 
    pa.project_id
)
SELECT 
  p.title as project_name,
  ps.total_tasks,
  ps.completed_tasks,
  as.total_activities,
  as.total_hours
FROM 
  projects p
LEFT JOIN 
  project_stats ps ON p.id = ps.project_id
LEFT JOIN 
  activity_stats as ON p.id = as.project_id
WHERE 
  p.is_visible = true;`} 
                    language="sql" 
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
