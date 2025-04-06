
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion } from "@/components/ui/accordion";
import { DocumentationSection } from "../components/DocumentationSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const ComponentsDocumentation = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>توثيق المكونات</CardTitle>
        <CardDescription>توثيق شامل لكافة المكونات والوحدات في النظام</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="core">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="core">المكونات الأساسية</TabsTrigger>
            <TabsTrigger value="hr">الموارد البشرية</TabsTrigger>
            <TabsTrigger value="finance">المالية</TabsTrigger>
          </TabsList>
          
          <TabsContent value="core" className="space-y-4">
            <Accordion type="single" collapsible className="w-full">
              <DocumentationSection 
                title="مكونات إدارة الفعاليات" 
                content={[
                  {
                    title: "EventCard",
                    description: "بطاقة عرض الفعالية في صفحة الأحداث والفعاليات"
                  },
                  {
                    title: "EventDetailsView",
                    description: "عرض تفاصيل الفعالية الكاملة"
                  },
                  {
                    title: "EventRegistrationForm",
                    description: "نموذج التسجيل في الفعالية"
                  },
                  {
                    title: "EventFeedbackForm",
                    description: "نموذج تقييم الفعالية"
                  },
                  {
                    title: "EventDashboard",
                    description: "لوحة معلومات الفعالية للمشرفين"
                  }
                ]}
              />
              
              <DocumentationSection 
                title="مكونات إدارة المشاريع" 
                content={[
                  {
                    title: "ProjectCard",
                    description: "بطاقة عرض المشروع في صفحة المشاريع"
                  },
                  {
                    title: "ProjectDetailsView",
                    description: "عرض تفاصيل المشروع الكامل"
                  },
                  {
                    title: "ProjectActivitiesList",
                    description: "قائمة أنشطة المشروع"
                  },
                  {
                    title: "ProjectDashboardTabs",
                    description: "تبويبات لوحة معلومات المشروع"
                  }
                ]}
              />
              
              <DocumentationSection 
                title="مكونات إدارة المستخدمين" 
                content={[
                  {
                    title: "UserNav",
                    description: "قائمة التنقل الخاصة بالمستخدم"
                  },
                  {
                    title: "UsersManagement",
                    description: "إدارة المستخدمين في النظام"
                  },
                  {
                    title: "AdminNavLinks",
                    description: "روابط التنقل لمدير النظام"
                  }
                ]}
              />
              
              <DocumentationSection 
                title="مكونات الإشعارات" 
                content={[
                  {
                    title: "NotificationBell",
                    description: "جرس الإشعارات في الشريط العلوي"
                  },
                  {
                    title: "NotificationList",
                    description: "قائمة الإشعارات"
                  },
                  {
                    title: "NotificationItem",
                    description: "عنصر الإشعار الفردي"
                  }
                ]}
              />
              
              <DocumentationSection 
                title="مكونات لوحة المعلومات" 
                content={[
                  {
                    title: "DashboardOverview",
                    description: "نظرة عامة على لوحة المعلومات"
                  },
                  {
                    title: "DashboardCharts",
                    description: "الرسوم البيانية في لوحة المعلومات"
                  },
                  {
                    title: "DashboardStats",
                    description: "إحصاءات لوحة المعلومات"
                  }
                ]}
              />
              
              <DocumentationSection 
                title="مكونات الشهادات" 
                content={[
                  {
                    title: "CertificateTemplates",
                    description: "قوالب الشهادات"
                  },
                  {
                    title: "CertificateSignatures",
                    description: "توقيعات الشهادات"
                  },
                  {
                    title: "CertificateVerification",
                    description: "التحقق من صحة الشهادات"
                  }
                ]}
              />
            </Accordion>
          </TabsContent>
          
          <TabsContent value="hr" className="space-y-4">
            <Accordion type="single" collapsible className="w-full">
              <DocumentationSection 
                title="مكونات إدارة الموظفين" 
                content={[
                  {
                    title: "EmployeesList",
                    description: "قائمة الموظفين في النظام"
                  },
                  {
                    title: "EmployeeScheduleField",
                    description: "حقل لتعيين جدول الموظف"
                  },
                  {
                    title: "HREmployees",
                    description: "صفحة إدارة الموظفين"
                  }
                ]}
              />
              
              <DocumentationSection 
                title="مكونات الحضور والانصراف" 
                content={[
                  {
                    title: "AttendanceManagement",
                    description: "إدارة الحضور والانصراف"
                  },
                  {
                    title: "AttendanceTable",
                    description: "جدول سجلات الحضور"
                  },
                  {
                    title: "HRAttendance",
                    description: "صفحة سجلات الحضور"
                  }
                ]}
              />
              
              <DocumentationSection 
                title="مكونات العقود" 
                content={[
                  {
                    title: "EmployeeContractsTabs",
                    description: "تبويبات عقود الموظفين"
                  },
                  {
                    title: "ContractsTab",
                    description: "تبويب العقود"
                  },
                  {
                    title: "ViewContractDialog",
                    description: "نافذة عرض تفاصيل العقد"
                  }
                ]}
              />
              
              <DocumentationSection 
                title="مكونات الإجازات" 
                content={[
                  {
                    title: "LeavesManagement",
                    description: "إدارة الإجازات"
                  },
                  {
                    title: "LeavesTable",
                    description: "جدول الإجازات"
                  },
                  {
                    title: "AddLeaveDialog",
                    description: "نافذة إضافة إجازة جديدة"
                  }
                ]}
              />
              
              <DocumentationSection 
                title="مكونات التدريب" 
                content={[
                  {
                    title: "HRTraining",
                    description: "صفحة إدارة التدريب"
                  },
                  {
                    title: "TrainingTab",
                    description: "تبويب التدريب"
                  }
                ]}
              />
              
              <DocumentationSection 
                title="مكونات التقارير" 
                content={[
                  {
                    title: "HRReportsPage",
                    description: "صفحة تقارير الموارد البشرية"
                  },
                  {
                    title: "AttendanceReport",
                    description: "تقرير الحضور"
                  },
                  {
                    title: "LeaveReport",
                    description: "تقرير الإجازات"
                  }
                ]}
              />
            </Accordion>
          </TabsContent>
          
          <TabsContent value="finance" className="space-y-4">
            <Accordion type="single" collapsible className="w-full">
              <DocumentationSection 
                title="مكونات المحاسبة" 
                content={[
                  {
                    title: "AccountingDashboard",
                    description: "لوحة معلومات المحاسبة"
                  },
                  {
                    title: "JournalEntries",
                    description: "قيود اليومية"
                  },
                  {
                    title: "GeneralLedger",
                    description: "دفتر الأستاذ العام"
                  },
                  {
                    title: "TrialBalance",
                    description: "ميزان المراجعة"
                  }
                ]}
              />
              
              <DocumentationSection 
                title="مكونات الموارد المالية" 
                content={[
                  {
                    title: "ResourceForm",
                    description: "نموذج إضافة موارد مالية"
                  },
                  {
                    title: "ResourcesTab",
                    description: "تبويب الموارد المالية"
                  },
                  {
                    title: "ResourcesReportCard",
                    description: "بطاقة تقرير الموارد المالية"
                  }
                ]}
              />
              
              <DocumentationSection 
                title="مكونات المصروفات" 
                content={[
                  {
                    title: "ExpensesTable",
                    description: "جدول المصروفات"
                  },
                  {
                    title: "ExpensesTab",
                    description: "تبويب المصروفات"
                  },
                  {
                    title: "DeleteExpenseDialog",
                    description: "نافذة حذف مصروف"
                  }
                ]}
              />
              
              <DocumentationSection 
                title="مكونات الالتزامات" 
                content={[
                  {
                    title: "ObligationsTable",
                    description: "جدول الالتزامات المالية"
                  },
                  {
                    title: "ObligationBalancesTable",
                    description: "جدول أرصدة الالتزامات"
                  },
                  {
                    title: "ObligationExpensesTable",
                    description: "جدول مصروفات الالتزامات"
                  }
                ]}
              />
              
              <DocumentationSection 
                title="مكونات الميزانية" 
                content={[
                  {
                    title: "BudgetItemsTable",
                    description: "جدول عناصر الميزانية"
                  },
                  {
                    title: "BudgetDistribution",
                    description: "توزيع الميزانية"
                  }
                ]}
              />
              
              <DocumentationSection 
                title="مكونات التقارير المالية" 
                content={[
                  {
                    title: "FinancialReports",
                    description: "التقارير المالية"
                  },
                  {
                    title: "ComparisonReportCard",
                    description: "بطاقة تقرير المقارنة"
                  },
                  {
                    title: "FinancialSummaryCard",
                    description: "بطاقة ملخص المالي"
                  }
                ]}
              />
            </Accordion>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
