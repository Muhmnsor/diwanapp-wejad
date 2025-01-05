import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { DashboardData } from "@/types/dashboard";

interface DashboardStatsProps {
  data: DashboardData;
  isLoading?: boolean;
  error?: Error | null;
}

export const DashboardStats = ({ data, isLoading, error }: DashboardStatsProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        حدث خطأ في تحميل البيانات
      </div>
    );
  }

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
          <CardTitle className="text-sm font-medium">أعلى حدث حضوراً</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold">{data.mostAttendedEvent.title}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {data.mostAttendedEvent.attendance} حاضر
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">أقل حدث حضوراً</CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold">{data.leastAttendedEvent.title}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {data.leastAttendedEvent.attendance} حاضر
          </div>
        </CardContent>
      </Card>
    </div>
  );
};