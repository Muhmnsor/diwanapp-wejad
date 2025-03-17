
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Activity, Users } from "lucide-react";

interface ActivitiesStatsSectionProps {
  activities: {
    total: number;
    completed: number;
  };
  averageAttendance: number;
}

export const ActivitiesStatsSection = ({
  activities,
  averageAttendance
}: ActivitiesStatsSectionProps) => {
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            إجمالي الأنشطة
          </CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activities.total}</div>
          <p className="text-xs text-muted-foreground mt-2">
            {activities.completed} أنشطة مكتملة ({activities.total - activities.completed} متبقية)
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            متوسط الحضور
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{averageAttendance.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground mt-2">
            نسبة الحضور في جميع الأنشطة
          </p>
        </CardContent>
      </Card>
    </>
  );
};
