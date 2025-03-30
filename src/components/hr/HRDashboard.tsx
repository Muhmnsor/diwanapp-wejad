
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AttendanceTab } from "./tabs/AttendanceTab";
import { CompensationTab } from "./tabs/CompensationTab";
import { TrainingTab } from "./tabs/TrainingTab";
import { ReportsTab } from "./tabs/ReportsTab";
import { Loader2 } from "lucide-react";
import { useHRStats } from "@/hooks/hr/useHRStats";
import { useHRPermissions } from "@/hooks/hr/useHRPermissions";

export function HRDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { data: hrStats, isLoading: isStatsLoading } = useHRStats();
  const { data: permissions, isLoading: isPermissionsLoading } = useHRPermissions();

  const isLoading = isStatsLoading || isPermissionsLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-60">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="mr-2">جاري تحميل البيانات...</span>
      </div>
    );
  }

  // If user doesn't have HR permissions, show access denied
  if (!permissions?.canViewHR) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6 text-center">
          <h2 className="text-xl font-bold text-red-500 mb-2">ليس لديك صلاحية الوصول</h2>
          <p>ليس لديك صلاحية الوصول إلى إدارة شؤون الموظفين</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* HR Dashboard Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الموظفين</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hrStats?.totalEmployees || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {hrStats?.newEmployees || 0} موظف جديد هذا الشهر
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">نسبة الحضور</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hrStats?.attendanceRate || 0}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {hrStats?.presentToday || 0} موظف حاضر اليوم
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">الإجازات النشطة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hrStats?.activeLeaves || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {hrStats?.upcomingLeaves || 0} إجازة قادمة هذا الأسبوع
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">العقود المنتهية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hrStats?.expiringContracts || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              عقود تنتهي خلال الشهر القادم
            </p>
          </CardContent>
        </Card>
      </div>

      {/* HR Tabs */}
      <Tabs 
        defaultValue="attendance" 
        className="space-y-6" 
        value={activeTab} 
        onValueChange={setActiveTab}
      >
        <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <TabsTrigger value="attendance">الحضور والإجازات</TabsTrigger>
          <TabsTrigger value="compensation">التعويضات والمزايا</TabsTrigger>
          <TabsTrigger value="training">التدريب والتطوير</TabsTrigger>
          <TabsTrigger value="reports">التقارير</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="space-y-4">
          <AttendanceTab />
        </TabsContent>
        
        <TabsContent value="compensation" className="space-y-4">
          <CompensationTab />
        </TabsContent>
        
        <TabsContent value="training" className="space-y-4">
          <TrainingTab />
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-4">
          <ReportsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
