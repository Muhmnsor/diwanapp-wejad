import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmployeeDistributionChart } from "../dashboard/EmployeeDistributionChart";
import { AttendanceTrendChart } from "../dashboard/AttendanceTrendChart";
import { LeaveDistributionChart } from "../dashboard/LeaveDistributionChart";
import { EmployeeStatusChart } from "../dashboard/EmployeeStatusChart";
import { useEmployees } from "@/hooks/hr/useEmployees";
import { useOrganizationalUnits } from "@/hooks/hr/useOrganizationalUnits";
import { Building2, UserRound, Users, CheckCircle2 } from "lucide-react";
import { OrganizationChart } from "../organization/OrganizationChart";
import { useHRStats } from "@/hooks/hr/useHRStats";
import { Skeleton } from "@/components/ui/skeleton";

const HROverview = () => {
  const { data: employees, isLoading: isLoadingEmployees } = useEmployees();
  const { data: units, isLoading: isLoadingUnits } = useOrganizationalUnits();
  const { data: stats, isLoading: isLoadingStats } = useHRStats();
  
  const activeEmployeesCount = employees?.filter(e => e.status === 'active').length || 0;
  const organizationalUnitsCount = units?.length || 0;

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">لوحة المعلومات الإدارية</h1>
        <p className="text-muted-foreground">نظرة عامة على بيانات الموظفين والهيكل التنظيمي</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">الموظفين</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoadingEmployees ? <Skeleton className="h-8 w-16" /> : employees?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {activeEmployeesCount} موظف نشط
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">الوحدات التنظيمية</CardTitle>
            <Building2 className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoadingUnits ? <Skeleton className="h-8 w-16" /> : organizationalUnitsCount}
            </div>
            <p className="text-xs text-muted-foreground">عدد الوحدات التنظيمية</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">الحضور اليوم</CardTitle>
            <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoadingStats ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                `${stats?.attendanceRate || 0}%`
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {isLoadingStats ? <Skeleton className="h-4 w-24" /> : `${stats?.presentToday || 0} موظف حاضر`}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">الإجازات اليوم</CardTitle>
            <UserRound className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoadingStats ? <Skeleton className="h-8 w-16" /> : stats?.activeLeaves || 0}
            </div>
            <p className="text-xs text-muted-foreground">موظفين في إجازة</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">الهيكل التنظيمي</h2>
        <OrganizationChart />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        <EmployeeDistributionChart />
        <EmployeeStatusChart />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        <AttendanceTrendChart />
        <LeaveDistributionChart />
      </div>
    </div>
  );
};

export default HROverview;
