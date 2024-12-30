import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface ActivityAttendanceCardProps {
  type: "highest" | "lowest";
  title: string;
  activity: {
    title: string;
    date: string;
    attendanceCount: number;
    totalRegistrations: number;
  } | null;
}

export const ActivityAttendanceCard = ({
  type,
  title,
  activity
}: ActivityAttendanceCardProps) => {
  const Icon = type === "highest" ? TrendingUp : TrendingDown;
  const iconColorClass = type === "highest" ? "text-green-500" : "text-red-500";

  if (!activity) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className={`h-4 w-4 ${iconColorClass}`} />
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">لا توجد أنشطة مكتملة</div>
        </CardContent>
      </Card>
    );
  }

  const percentage = ((activity.attendanceCount / activity.totalRegistrations) * 100).toFixed(0);
  const formattedDate = format(new Date(activity.date), 'dd MMMM yyyy', { locale: ar });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${iconColorClass}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{percentage}%</div>
        <div className="text-xs text-muted-foreground mt-1 space-y-1">
          <div className="font-medium">{activity.title}</div>
          <div>الحضور: {activity.attendanceCount} من {activity.totalRegistrations}</div>
          <div className="text-xs opacity-70">{formattedDate}</div>
        </div>
      </CardContent>
    </Card>
  );
};