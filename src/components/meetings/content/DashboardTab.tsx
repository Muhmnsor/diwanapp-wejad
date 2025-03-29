
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMeetingsDashboard } from "@/hooks/meetings/useMeetingsDashboard";
import { MeetingStatCards } from "../dashboard/MeetingStatCards";
import { MeetingStatusChart } from "../dashboard/MeetingStatusChart";
import { MeetingTypePieChart } from "../dashboard/MeetingTypePieChart";
import { AttendanceTypePieChart } from "../dashboard/AttendanceTypePieChart";
import { MeetingMonthlyChart } from "../dashboard/MeetingMonthlyChart";

export const DashboardTab = () => {
  const { data, isLoading, error } = useMeetingsDashboard();

  if (error) {
    return (
      <Card className="rtl text-right">
        <CardHeader>
          <CardTitle>لوحة معلومات الاجتماعات</CardTitle>
          <CardDescription>عرض إحصائيات ومعلومات الاجتماعات</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-red-500">
            <p>حدث خطأ أثناء تحميل البيانات. يرجى المحاولة مرة أخرى.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rtl text-right">
      <CardHeader>
        <CardTitle>لوحة معلومات الاجتماعات</CardTitle>
        <CardDescription>عرض إحصائيات ومعلومات الاجتماعات</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* إحصائيات سريعة */}
        <MeetingStatCards
          totalMeetings={data?.totalMeetings || 0}
          upcomingMeetings={data?.upcomingMeetings || 0}
          inProgressMeetings={data?.inProgressMeetings || 0}
          completedMeetings={data?.completedMeetings || 0}
          averageAttendance={data?.averageAttendance || undefined}
          isLoading={isLoading}
        />

        {/* حالة الاجتماعات والتوزيع الشهري */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MeetingStatusChart
            data={data?.statusDistribution || []}
            isLoading={isLoading}
          />
          <MeetingMonthlyChart
            data={data?.monthlyDistribution || []}
            isLoading={isLoading}
          />
        </div>

        {/* توزيع أنواع الاجتماعات وطريقة الحضور */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MeetingTypePieChart
            data={data?.typeDistribution || []}
            isLoading={isLoading}
          />
          <AttendanceTypePieChart
            data={data?.attendanceTypeDistribution || []}
            isLoading={isLoading}
          />
        </div>
      </CardContent>
    </Card>
  );
};
