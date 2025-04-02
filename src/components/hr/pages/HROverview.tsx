
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useHRStats, getTrendDirection, getTrendPercentage } from "@/hooks/hr/useHRStats";
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from "lucide-react";
import { EmployeeDistributionChart } from "@/components/hr/dashboard/EmployeeDistributionChart";
import { EmployeeStatusChart } from "@/components/hr/dashboard/EmployeeStatusChart";
import { AttendanceTrendChart } from "@/components/hr/dashboard/AttendanceTrendChart";
import { LeaveDistributionChart } from "@/components/hr/dashboard/LeaveDistributionChart";
import { Badge } from "@/components/ui/badge";

export const HROverview = () => {
  const { data: stats, isLoading } = useHRStats();
  
  const renderTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowUpIcon className="h-4 w-4 text-green-500" />;
      case 'down':
        return <ArrowDownIcon className="h-4 w-4 text-red-500" />;
      default:
        return <MinusIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">نظرة عامة الموارد البشرية</h2>
      
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الموظفين</CardTitle>
            <div className="flex items-center">
              {!isLoading && renderTrendIcon(getTrendDirection(stats?.trends.employeeTrend || []))}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : stats?.totalEmployees}</div>
            {!isLoading && stats?.trends.employeeTrend && (
              <p className="text-xs text-muted-foreground">
                {getTrendPercentage(stats.trends.employeeTrend)}% من الشهر الماضي
              </p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">نسبة الحضور اليوم</CardTitle>
            <div className="flex items-center">
              {!isLoading && renderTrendIcon(getTrendDirection(stats?.trends.attendanceTrend || []))}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : `${stats?.attendanceRate}%`}</div>
            {!isLoading && stats?.trends.attendanceTrend && (
              <p className="text-xs text-muted-foreground">
                {getTrendPercentage(stats.trends.attendanceTrend)}% من الأسبوع الماضي
              </p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الإجازات النشطة</CardTitle>
            <div className="flex items-center">
              {!isLoading && renderTrendIcon(getTrendDirection(stats?.trends.leaveTrend || []))}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : stats?.activeLeaves}</div>
            {!isLoading && stats?.trends.leaveTrend && (
              <p className="text-xs text-muted-foreground">
                {getTrendPercentage(stats.trends.leaveTrend)}% من الشهر الماضي
              </p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">العقود المنتهية قريباً</CardTitle>
            <div className="flex items-center">
              {!isLoading && renderTrendIcon(getTrendDirection(stats?.trends.contractsTrend || []))}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : stats?.expiringContracts}</div>
            {!isLoading && stats?.trends.contractsTrend && (
              <p className="text-xs text-muted-foreground">
                {getTrendPercentage(stats.trends.contractsTrend)}% من الشهر الماضي
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <EmployeeDistributionChart />
        <EmployeeStatusChart />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <AttendanceTrendChart />
        <LeaveDistributionChart />
      </div>
      
      {/* Alerts Section */}
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
        {/* Expiring Contracts Alert */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">العقود المنتهية قريباً</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>جاري التحميل...</p>
            ) : (
              <div className="space-y-4">
                {stats?.expiringContractDetails.map((contract) => (
                  <div key={contract.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">{contract.employeeName}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{contract.contractType}</span>
                        <Badge variant={contract.daysRemaining <= 7 ? "destructive" : "secondary"}>
                          {contract.daysRemaining} يوم متبقي
                        </Badge>
                      </div>
                    </div>
                    <span className="text-sm">{contract.expiryDate}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Urgent Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">المهام العاجلة</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>جاري التحميل...</p>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">مراجعة طلبات الإجازة المعلقة</p>
                    <Badge variant="destructive">عاجل</Badge>
                  </div>
                  <span className="text-sm">اليوم</span>
                </div>
                <div className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">إعداد تقارير الحضور الشهرية</p>
                    <Badge variant="secondary">متوسط</Badge>
                  </div>
                  <span className="text-sm">غداً</span>
                </div>
                <div className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">تجديد عقود الموظفين المنتهية</p>
                    <Badge variant="destructive">عاجل</Badge>
                  </div>
                  <span className="text-sm">خلال 3 أيام</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HROverview;
