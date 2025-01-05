import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface ActivityAttendanceCardProps {
  type: "highest" | "lowest";
  title: string;
  activity?: {
    eventId: string;
    title: string;
    date: string;
    count: number;
    totalRegistrations: number;
    attendanceRate: number;
  };
}

export const ActivityAttendanceCard = ({
  type,
  title,
  activity
}: ActivityAttendanceCardProps) => {
  const Icon = type === "highest" ? TrendingUp : TrendingDown;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {activity ? (
          <>
            <div className="text-lg font-bold truncate" title={activity.title}>
              {activity.title}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {activity.attendanceRate.toFixed(1)}% نسبة الحضور
            </div>
            <div className="text-xs text-muted-foreground">
              {activity.count} من {activity.totalRegistrations} مسجل
            </div>
          </>
        ) : (
          <div className="text-sm text-muted-foreground">
            لا توجد بيانات
          </div>
        )}
      </CardContent>
    </Card>
  );
};