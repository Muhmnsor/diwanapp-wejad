
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Activity } from "lucide-react";
import { useProjectActivityStats } from "@/hooks/useProjectActivityStats";

interface ProjectActivitiesStatsCardProps {
  projectId: string;
}

export const ProjectActivitiesStatsCard = ({ projectId }: ProjectActivitiesStatsCardProps) => {
  const { data, isLoading } = useProjectActivityStats(projectId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">تقييم أنشطة المشروع</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="h-20 animate-pulse bg-muted rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  const rating = data?.averageRating || 0;
  const ratingColor = rating >= 4 ? 'text-green-500' : rating >= 3 ? 'text-yellow-500' : 'text-red-500';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">تقييم أنشطة المشروع</CardTitle>
        <Activity className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">
              {rating.toFixed(1)}
            </span>
            <Star className={`h-5 w-5 ${ratingColor}`} />
          </div>
          <div className="flex flex-col gap-1 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>عدد الأنشطة:</span>
              <span className="font-medium">{data?.totalActivities}</span>
            </div>
            <div className="flex justify-between">
              <span>الأنشطة المقيمة:</span>
              <span className="font-medium">{data?.ratedActivities}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
