
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  AlertCircleIcon, 
  CalendarIcon, 
  UserIcon,
  ClockIcon,
  FileTextIcon
} from "lucide-react";
import { StatCard } from "@/components/hr/dashboard/StatCard";
import { ContractExpiryAlert } from "@/components/hr/dashboard/ContractExpiryAlert";
import { useHRStats, getTrendDirection, getTrendPercentage } from "@/hooks/hr/useHRStats";
import { EmployeeDistributionChart } from "@/components/hr/dashboard/EmployeeDistributionChart";
import { EmployeeStatusChart } from "@/components/hr/dashboard/EmployeeStatusChart";
import { AttendanceTrendChart } from "@/components/hr/dashboard/AttendanceTrendChart";
import { LeaveDistributionChart } from "@/components/hr/dashboard/LeaveDistributionChart";

const HROverview = () => {
  const { data: stats, isLoading } = useHRStats();

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowUpIcon className="h-4 w-4 text-emerald-500" />;
      case 'down':
        return <ArrowDownIcon className="h-4 w-4 text-rose-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">لوحة مؤشرات الموارد البشرية</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="إجمالي الموظفين"
          value={isLoading ? "..." : String(stats?.totalEmployees || 0)}
          icon={<UserIcon className="h-4 w-4" />}
          trend={isLoading ? null : getTrendIcon(getTrendDirection(stats?.trends.employeeTrend || []))}
          trendValue={isLoading ? "" : `${getTrendPercentage(stats?.trends.employeeTrend || [])}%`}
          isLoading={isLoading}
        />
        <StatCard 
          title="نسبة الحضور"
          value={isLoading ? "..." : `${stats?.attendanceRate || 0}%`}
          icon={<ClockIcon className="h-4 w-4" />}
          trend={isLoading ? null : getTrendIcon(getTrendDirection(stats?.trends.attendanceTrend || []))}
          trendValue={isLoading ? "" : `${getTrendPercentage(stats?.trends.attendanceTrend || [])}%`}
          isLoading={isLoading}
        />
        <StatCard 
          title="إجازات نشطة"
          value={isLoading ? "..." : String(stats?.activeLeaves || 0)}
          icon={<CalendarIcon className="h-4 w-4" />}
          trend={isLoading ? null : getTrendIcon(getTrendDirection(stats?.trends.leaveTrend || []))}
          trendValue={isLoading ? "" : `${getTrendPercentage(stats?.trends.leaveTrend || [])}%`}
          isLoading={isLoading}
        />
        <StatCard 
          title="عقود منتهية قريباً"
          value={isLoading ? "..." : String(stats?.expiringContracts || 0)}
          icon={<FileTextIcon className="h-4 w-4" />}
          trend={isLoading ? null : getTrendIcon(getTrendDirection(stats?.trends.contractsTrend || []))}
          trendValue={isLoading ? "" : `${getTrendPercentage(stats?.trends.contractsTrend || [])}%`}
          isLoading={isLoading}
          valueColor={stats?.expiringContracts && stats.expiringContracts > 0 ? "text-amber-500" : undefined}
        />
      </div>

      {/* Charts & Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="distribution" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="distribution">توزيع الموظفين</TabsTrigger>
              <TabsTrigger value="status">حالة العقود</TabsTrigger>
              <TabsTrigger value="attendance">الحضور</TabsTrigger>
              <TabsTrigger value="leaves">الإجازات</TabsTrigger>
            </TabsList>
            
            <TabsContent value="distribution" className="mt-4">
              <EmployeeDistributionChart />
            </TabsContent>
            
            <TabsContent value="status" className="mt-4">
              <EmployeeStatusChart />
            </TabsContent>
            
            <TabsContent value="attendance" className="mt-4">
              <AttendanceTrendChart />
            </TabsContent>
            
            <TabsContent value="leaves" className="mt-4">
              <LeaveDistributionChart />
            </TabsContent>
          </Tabs>
          
          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">أداء الموظفين</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>معدل الإنتاجية</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">87%</span>
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">+5%</Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>معدل الغياب</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">3.2%</span>
                      <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">+0.5%</Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>الوقت الإضافي</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">45 ساعة</span>
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">+10%</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">مهام عاجلة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>مراجعة طلبات الإجازة</span>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      {isLoading ? "0" : stats?.upcomingLeaves || 0} طلب
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>تجديد العقود</span>
                    <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">
                      {isLoading ? "0" : stats?.expiringContracts || 0} عقد
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>تدريبات معلقة</span>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {isLoading ? "0" : stats?.pendingTrainings || 0} تدريب
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Alerts & KPIs */}
        <div className="space-y-4">
          {/* Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertCircleIcon className="h-4 w-4 text-amber-500" />
                <span>تنبيهات العقود</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-[300px] overflow-y-auto">
              {isLoading ? (
                <p className="text-gray-500 text-center py-4">جاري تحميل البيانات...</p>
              ) : stats?.expiringContractDetails && stats.expiringContractDetails.length > 0 ? (
                <div className="space-y-3">
                  {stats.expiringContractDetails.map((contract) => (
                    <ContractExpiryAlert 
                      key={contract.id}
                      employeeName={contract.employeeName}
                      expiryDate={contract.expiryDate}
                      daysRemaining={contract.daysRemaining}
                      contractType={contract.contractType}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">لا توجد عقود منتهية قريباً</p>
              )}
            </CardContent>
          </Card>
          
          {/* KPIs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">مؤشرات الأداء الرئيسية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>معدل دوران الموظفين</span>
                    <span className="font-medium">4.2%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '20%' }}></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>رضا الموظفين</span>
                    <span className="font-medium">78%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>اكتمال التدريب</span>
                    <span className="font-medium">65%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HROverview;
