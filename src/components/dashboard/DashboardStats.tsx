import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, TrendingUp, TrendingDown, DollarSign, Star, UserCheck, UserX } from "lucide-react";
import { DashboardData } from "@/types/dashboard";

interface DashboardStatsProps {
  data: DashboardData;
}

export const DashboardStats = ({ data }: DashboardStatsProps) => {
  console.log("DashboardStats data:", data);
  
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
          <CardTitle className="text-sm font-medium">أعلى حدث حضوراً</CardTitle>
          <UserCheck className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold">{data.mostAttendedEvent.title}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {data.mostAttendedEvent.attendanceCount} حاضر ({data.mostAttendedEvent.percentage.toFixed(1)}%)
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">أقل حدث حضوراً</CardTitle>
          <UserX className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold">{data.leastAttendedEvent.title}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {data.leastAttendedEvent.attendanceCount} حاضر ({data.leastAttendedEvent.percentage.toFixed(1)}%)
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">متوسط الحضور</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.averageAttendance.toFixed(1)}%</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">أعلى حدث تقييماً</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold">{data.highestRatedEvent.title}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {data.highestRatedEvent.rating.toFixed(1)} من 5
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">أقل حدث تقييماً</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold">{data.lowestRatedEvent.title}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {data.lowestRatedEvent.rating.toFixed(1)} من 5
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">متوسط التقييم</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.averageRating.toFixed(1)} من 5</div>
        </CardContent>
      </Card>
    </div>
  );
};