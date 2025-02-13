
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Star, TrendingDown, TrendingUp } from "lucide-react";
import { useProjectOverallRating } from "@/hooks/useProjectOverallRating";

interface ProjectOverallRatingCardProps {
  projectId: string;
}

export const ProjectOverallRatingCard = ({ projectId }: ProjectOverallRatingCardProps) => {
  const { data, isLoading } = useProjectOverallRating(projectId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">التقييم العام للمشروع</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="h-24 animate-pulse bg-muted rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">التقييم العام للمشروع</CardTitle>
        <Award className={`h-4 w-4 ${getRatingColor(data?.totalRating || 0)}`} />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className={`text-2xl font-bold ${getRatingColor(data?.totalRating || 0)}`}>
              {(data?.totalRating || 0).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              تم تقييم {data?.activitiesCount || 0} نشاط
            </p>
          </div>

          {data?.highestRated && (
            <div className="flex items-center text-xs space-x-2 rtl:space-x-reverse">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <div className="flex-1">
                <p className="text-muted-foreground">الأعلى تقييماً</p>
                <p className="font-medium truncate">{data.highestRated.title}</p>
                <p className="text-green-500">{data.highestRated.rating.toFixed(1)} ⭐</p>
              </div>
            </div>
          )}

          {data?.lowestRated && (
            <div className="flex items-center text-xs space-x-2 rtl:space-x-reverse">
              <TrendingDown className="h-4 w-4 text-red-500" />
              <div className="flex-1">
                <p className="text-muted-foreground">الأقل تقييماً</p>
                <p className="font-medium truncate">{data.lowestRated.title}</p>
                <p className="text-red-500">{data.lowestRated.rating.toFixed(1)} ⭐</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
