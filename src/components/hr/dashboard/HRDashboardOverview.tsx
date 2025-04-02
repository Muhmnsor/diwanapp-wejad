
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useHRStats } from "@/hooks/hr/useHRStats";
import { Sparklines, SparklinesLine } from "react-sparklines";
import { Users, UserPlus, ClipboardCheck, Clock, UserCheck, CalendarClock, FileWarning, Award } from "lucide-react";

export function HRDashboardOverview() {
  const { data: stats, isLoading } = useHRStats();

  const dummyAttendanceData = [65, 72, 86, 81, 78, 91, 85, 89, 92, 88];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
              <div className="h-7 w-16 bg-gray-300 rounded mt-2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-10 bg-gray-100 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">نظرة عامة على الموارد البشرية</h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Employees Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الموظفين</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalEmployees}</div>
            <div className="h-[40px] mt-2">
              <Sparklines data={[65, 75, 70, 80, 85, 90, stats?.totalEmployees]} height={40} margin={5}>
                <SparklinesLine color="#3b82f6" />
              </Sparklines>
            </div>
          </CardContent>
        </Card>

        {/* New Employees Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">موظفين جدد (هذا الشهر)</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.newEmployees}</div>
            <div className="h-[40px] mt-2">
              <Sparklines data={[2, 3, 1, 4, 2, 5, stats?.newEmployees]} height={40} margin={5}>
                <SparklinesLine color="#10b981" />
              </Sparklines>
            </div>
          </CardContent>
        </Card>

        {/* Present Today Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الحضور اليوم</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.presentToday}</div>
            <div className="h-[40px] mt-2">
              <Sparklines data={dummyAttendanceData} height={40} margin={5}>
                <SparklinesLine color="#6366f1" />
              </Sparklines>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Rate Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">نسبة الحضور</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.attendanceRate}%</div>
            <div className="h-[40px] mt-2">
              <Sparklines data={[88, 92, 85, 89, 91, 84, stats?.attendanceRate]} height={40} margin={5}>
                <SparklinesLine color="#f59e0b" />
              </Sparklines>
            </div>
          </CardContent>
        </Card>

        {/* Active Leaves Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجازات حالية</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeLeaves}</div>
            <div className="h-[40px] mt-2">
              <Sparklines data={[1, 2, 3, 1, 4, 2, stats?.activeLeaves]} height={40} margin={5}>
                <SparklinesLine color="#ef4444" />
              </Sparklines>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Leaves Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجازات قادمة</CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.upcomingLeaves}</div>
            <div className="h-[40px] mt-2">
              <Sparklines data={[3, 2, 5, 7, 4, 6, stats?.upcomingLeaves]} height={40} margin={5}>
                <SparklinesLine color="#8b5cf6" />
              </Sparklines>
            </div>
          </CardContent>
        </Card>

        {/* Expiring Contracts Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">عقود قاربت على الانتهاء</CardTitle>
            <FileWarning className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.expiringContracts}</div>
            <div className="h-[40px] mt-2">
              <Sparklines data={[2, 1, 3, 5, 2, 4, stats?.expiringContracts]} height={40} margin={5}>
                <SparklinesLine color="#ec4899" />
              </Sparklines>
            </div>
          </CardContent>
        </Card>

        {/* Pending Trainings Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">تدريبات معلقة</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingTrainings}</div>
            <div className="h-[40px] mt-2">
              <Sparklines data={[5, 8, 6, 9, 7, 10, stats?.pendingTrainings]} height={40} margin={5}>
                <SparklinesLine color="#f97316" />
              </Sparklines>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
