
import { useHRStats, getTrendDirection } from "@/hooks/hr/useHRStats";
import { 
  Users, 
  CalendarClock, 
  Calendar, 
  Briefcase, 
  GraduationCap, 
  AlertCircle,
  UserPlus,
  Building,
  Clock,
  ChartBar,
  ChartPie,
  BarChart,
  LineChart
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/hr/dashboard/StatCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmployeeDistributionChart } from "@/components/hr/dashboard/EmployeeDistributionChart";
import { AttendanceTrendChart } from "@/components/hr/dashboard/AttendanceTrendChart";
import { EmployeeStatusChart } from "@/components/hr/dashboard/EmployeeStatusChart";
import { LeaveDistributionChart } from "@/components/hr/dashboard/LeaveDistributionChart";
import { ContractExpiryAlert } from "@/components/hr/dashboard/ContractExpiryAlert";

// Default trend data for components that don't have it
const defaultTrendData = [5, 10, 8, 15, 20, 18, 25];

const HROverview = () => {
  const { data: stats, isLoading: isLoadingStats } = useHRStats();

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">نظرة عامة على شؤون الموظفين</h1>
        <p className="text-muted-foreground">إحصائيات ومؤشرات أداء إدارة شؤون الموظفين</p>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {isLoadingStats ? (
          <>
            <Card className="p-4"><Skeleton className="h-24 w-full" /></Card>
            <Card className="p-4"><Skeleton className="h-24 w-full" /></Card>
            <Card className="p-4"><Skeleton className="h-24 w-full" /></Card>
          </>
        ) : (
          <>
            <StatCard
              title="الموظفين"
              value={stats?.totalEmployees || 0}
              description={`${stats?.newEmployees || 0} موظف جديد هذا الشهر`}
              icon={<Users className="h-6 w-6 text-blue-600" />}
              trendData={stats?.trends?.employeeTrend || defaultTrendData}
              trendColor="#3b82f6"
            />
            
            <StatCard
              title="الحضور اليوم"
              value={stats?.presentToday || 0}
              description={`نسبة الحضور: ${stats?.attendanceRate || 0}%`}
              icon={<CalendarClock className="h-6 w-6 text-green-600" />}
              trendData={stats?.trends?.attendanceTrend || defaultTrendData}
              trendColor="#22c55e"
            />
            
            <StatCard
              title="الإجازات النشطة"
              value={stats?.activeLeaves || 0}
              description={`${stats?.upcomingLeaves || 0} إجازة في الأسبوع القادم`}
              icon={<Calendar className="h-6 w-6 text-amber-600" />}
              trendData={stats?.trends?.leaveTrend || defaultTrendData}
              trendColor="#f59e0b"
            />
          </>
        )}
      </div>

      {/* Secondary Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {isLoadingStats ? (
          <>
            <Card className="p-4"><Skeleton className="h-24 w-full" /></Card>
            <Card className="p-4"><Skeleton className="h-24 w-full" /></Card>
            <Card className="p-4"><Skeleton className="h-24 w-full" /></Card>
          </>
        ) : (
          <>
            <StatCard
              title="العقود المنتهية قريباً"
              value={stats?.expiringContracts || 0}
              description="خلال الشهر القادم"
              icon={<Briefcase className="h-6 w-6 text-purple-600" />}
              trendData={stats?.trends?.contractsTrend || defaultTrendData}
              trendColor="#9333ea"
            />
            
            <StatCard
              title="التدريبات الحالية"
              value={stats?.pendingTrainings || 0}
              description="برامج تدريبية قيد التنفيذ"
              icon={<GraduationCap className="h-6 w-6 text-cyan-600" />}
              trendData={stats?.trends?.trainingTrend || defaultTrendData}
              trendColor="#0891b2"
            />
            
            <StatCard
              title="المهام العاجلة"
              value={stats?.urgentTasks || 3}
              description="مهام تحتاج إلى متابعة فورية"
              icon={<AlertCircle className="h-6 w-6 text-red-600" />}
              trendData={stats?.trends?.tasksTrend || defaultTrendData}
              trendColor="#dc2626"
            />
          </>
        )}
      </div>

      {/* Detailed Analysis Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>تحليلات تفصيلية</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="employees" className="space-y-4">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="employees">الموظفين</TabsTrigger>
              <TabsTrigger value="attendance">الحضور</TabsTrigger>
              <TabsTrigger value="leaves">الإجازات</TabsTrigger>
              <TabsTrigger value="performance">الأداء</TabsTrigger>
            </TabsList>
            
            <TabsContent value="employees" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <EmployeeDistributionChart />
                <EmployeeStatusChart />
              </div>
            </TabsContent>
            
            <TabsContent value="attendance" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <AttendanceTrendChart />
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">معدل الحضور اليومي</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingStats ? (
                      <Skeleton className="h-60 w-full" />
                    ) : (
                      <div className="h-60 flex items-center justify-center">
                        <p className="text-muted-foreground">بيانات معدل الحضور اليومي</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="leaves" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <LeaveDistributionChart />
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">استخدام رصيد الإجازات</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingStats ? (
                      <Skeleton className="h-60 w-full" />
                    ) : (
                      <div className="h-60 flex items-center justify-center">
                        <p className="text-muted-foreground">بيانات استخدام رصيد الإجازات</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="performance" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">مؤشرات الأداء</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingStats ? (
                      <Skeleton className="h-60 w-full" />
                    ) : (
                      <div className="h-60 flex items-center justify-center">
                        <p className="text-muted-foreground">بيانات مؤشرات الأداء</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">معدل دوران الموظفين</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingStats ? (
                      <Skeleton className="h-60 w-full" />
                    ) : (
                      <div className="h-60 flex items-center justify-center">
                        <p className="text-muted-foreground">بيانات معدل دوران الموظفين</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Alerts and Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ContractExpiryAlert expiringContracts={stats?.expiringContractDetails || []} />
        <Card>
          <CardHeader>
            <CardTitle>المهام العاجلة</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              stats?.urgentTasks ? (
                <ul className="space-y-2">
                  <li className="flex items-center justify-between border-b pb-2">
                    <span>مراجعة طلبات الإجازة المعلقة</span>
                    <Badge variant="outline" className="bg-amber-100 text-amber-800">عاجل</Badge>
                  </li>
                  <li className="flex items-center justify-between border-b pb-2">
                    <span>إكمال تقييمات الأداء الشهرية</span>
                    <Badge variant="outline" className="bg-red-100 text-red-800">متأخر</Badge>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>تحديث سجلات التدريب</span>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">قيد التنفيذ</Badge>
                  </li>
                </ul>
              ) : (
                <p className="text-muted-foreground text-center py-8">لا توجد مهام عاجلة حالياً</p>
              )
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HROverview;
