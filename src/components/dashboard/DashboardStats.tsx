import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, TrendingUp, TrendingDown, DollarSign, Star, UserCheck } from "lucide-react";
import { DashboardData } from "@/types/dashboard";

interface DashboardStatsProps {
  data: DashboardData;
}

export const DashboardStats = ({ data }: DashboardStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي الأحداث</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.totalEvents}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {data.projectsCount} مشروع | {data.eventsCount} فعالية
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {data.upcomingEvents} حدث قادم | {data.pastEvents} حدث سابق
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي المسجلين</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.totalRegistrations}</div>
          <div className="text-xs text-muted-foreground mt-1">
            معدل {(data.totalRegistrations / data.totalEvents).toFixed(1)} لكل حدث
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.totalRevenue} ريال</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">أعلى حدث تسجيلاً</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold">{data.mostRegisteredEvent.title}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {data.mostRegisteredEvent.registrations} مسجل
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">أقل حدث تسجيلاً</CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold">{data.leastRegisteredEvent.title}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {data.leastRegisteredEvent.registrations} مسجل
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">أعلى حدث تقييماً</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold">{data.highestRatedEvent.title}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {data.highestRatedEvent.rating} من 5
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">الحدث الأكثر حضوراً</CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold">{data.mostAttendedEvent.title}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {data.mostAttendedEvent.attendanceCount} حاضر من {data.mostAttendedEvent.totalRegistrations} مسجل
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">الحدث الأقل حضوراً</CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold">{data.leastAttendedEvent.title}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {data.leastAttendedEvent.attendanceCount} حاضر من {data.leastAttendedEvent.totalRegistrations} مسجل
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">الحدث الأقل تقييماً</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold">{data.lowestRatedEvent.title}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {data.lowestRatedEvent.rating} من 5
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">متوسط التقييم العام</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.overallAverageRating}</div>
          <div className="text-xs text-muted-foreground mt-1">
            من 5 نجوم
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي الحضور</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.totalAttendance}</div>
          <div className="text-xs text-muted-foreground mt-1">
            من {data.totalRegistrations} مسجل
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
