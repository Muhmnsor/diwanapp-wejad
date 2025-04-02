import { useState, useEffect } from "react";
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, UserCheck, GraduationCap, Calendar, DollarSign, Search, Settings } from "lucide-react";
import { EmployeesTab } from "@/components/hr/tabs/EmployeesTab";
import { AttendanceTab } from "@/components/hr/tabs/AttendanceTab";
import { TrainingTab } from "@/components/hr/tabs/TrainingTab";
import { CompensationTab } from "@/components/hr/tabs/CompensationTab";
import { ReportsTab } from "@/components/hr/tabs/ReportsTab";
import { HRSettingsTabs } from "@/components/hr/settings/HRSettingsTabs";
import { useHRStats } from "@/hooks/hr/useHRStats";
import { usePermissions } from "@/components/permissions/usePermissions";
import { Input } from "@/components/ui/input";

const HR = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { data: stats, isLoading: isLoadingStats } = useHRStats();
  const { hasPermission } = usePermissions();
  const [searchTerm, setSearchTerm] = useState("");

  const hasHRAccess = hasPermission("hr", "view");
  const canManageEmployees = hasPermission("hr", "manage_employees");
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <TopHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary text-right my-[13px]">نظام إدارة شؤون الموظفين</h1>
          <p className="text-muted-foreground text-right">إدارة شاملة لشؤون الموظفين والموارد البشرية</p>
        </div>

        <div className="w-full flex justify-end my-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="بحث..."
              className="pl-10 pr-4 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              dir="rtl"
            />
          </div>
        </div>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full" dir="rtl">
          <TabsList className="grid grid-cols-7 w-full mb-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>نظرة عامة</span>
            </TabsTrigger>
            <TabsTrigger value="employees" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              <span>الموظفين</span>
            </TabsTrigger>
            <TabsTrigger value="attendance" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>الحضور والإجازات</span>
            </TabsTrigger>
            <TabsTrigger value="training" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              <span>التدريب والتطوير</span>
            </TabsTrigger>
            <TabsTrigger value="compensation" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span>التعويضات والمزايا</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>التقارير</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>الإعدادات</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-right text-lg">إجمالي الموظفين</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{isLoadingStats ? "..." : stats?.totalEmployees || 0}</div>
                  <p className="text-sm text-muted-foreground">
                    {stats?.newEmployees ? `${stats.newEmployees} موظفين جدد هذا الشهر` : "لا يوجد موظفين جدد"}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-right text-lg">الحضور اليوم</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{isLoadingStats ? "..." : stats?.presentToday || 0}</div>
                  <p className="text-sm text-muted-foreground">
                    {isLoadingStats ? "..." : `${stats?.attendanceRate || 0}% نسبة الحضور`}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-right text-lg">الإجازات النشطة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{isLoadingStats ? "..." : stats?.activeLeaves || 0}</div>
                  <p className="text-sm text-muted-foreground">
                    {isLoadingStats ? "..." : `${stats?.upcomingLeaves || 0} إجازات متوقعة الأسبوع القادم`}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-right">الإشعارات والتنبيهات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 rounded-lg text-right">
                    <p className="font-medium">{stats?.expiringContracts || 0} عقود ستنتهي هذا الشهر</p>
                    <p className="text-sm text-muted-foreground">يجب مراجعة العقود والتجديد إذا لزم الأمر</p>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-lg text-right">
                    <p className="font-medium">{stats?.pendingTrainings || 0} موظفين لم يكملوا التدريب الإلزامي</p>
                    <p className="text-sm text-muted-foreground">يجب متابعة حالة التدريب للالتزام بالمتطلبات</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="employees">
            <EmployeesTab searchTerm={searchTerm} />
          </TabsContent>

          <TabsContent value="attendance">
            <AttendanceTab />
          </TabsContent>

          <TabsContent value="training">
            <TrainingTab />
          </TabsContent>

          <TabsContent value="compensation">
            <CompensationTab />
          </TabsContent>

          <TabsContent value="reports">
            <ReportsTab />
          </TabsContent>
          
          <TabsContent value="settings">
            <HRSettingsTabs />
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default HR;
