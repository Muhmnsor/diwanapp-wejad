import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, TrendingUp } from "lucide-react";

interface DashboardStatsCardsProps {
  stats: {
    registrationCount: number;
    remainingSeats: number;
    occupancyRate: number;
  };
  eventDate: string;
  eventTime: string;
  eventPath?: string;
  eventCategory?: string;
}

export const DashboardStatsCards = ({
  stats,
  eventDate,
  eventTime,
  eventPath,
  eventCategory
}: DashboardStatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">عدد التسجيلات</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.registrationCount}</div>
          <div className="text-xs text-muted-foreground mt-1">
            معدل الإشغال {stats.occupancyRate.toFixed(1)}%
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">المقاعد المتبقية</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.remainingSeats}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {eventDate} - {eventTime}
          </div>
        </CardContent>
      </Card>

      {eventPath && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المسار</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eventPath}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {eventCategory}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};