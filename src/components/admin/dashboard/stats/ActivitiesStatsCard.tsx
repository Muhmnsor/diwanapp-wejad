import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

interface ActivitiesStatsCardProps {
  activities: {
    total: number;
    completed: number;
    averageAttendance: number;
  };
}

export const ActivitiesStatsCard = ({ activities }: ActivitiesStatsCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">الأنشطة والحضور</CardTitle>
        <Calendar className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {activities ? `${activities.completed}/${activities.total}` : '0/0'}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          متوسط الحضور: {activities?.averageAttendance || 0}%
        </p>
      </CardContent>
    </Card>
  );
};