import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

interface ActivitiesStatsCardProps {
  activities: {
    total: number;
    completed: number;
  };
}

export const ActivitiesStatsCard = ({ activities }: ActivitiesStatsCardProps) => {
  console.log("Activities stats:", activities);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">الأنشطة المنفذة</CardTitle>
        <Calendar className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {activities ? `${activities.completed} من ${activities.total}` : '0 من 0'}
        </div>
      </CardContent>
    </Card>
  );
};