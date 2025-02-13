
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import { useActivityRating } from "@/hooks/useActivityRating";

interface ProjectActivitiesRatingCardProps {
  projectId: string;
}

export const ProjectActivitiesRatingCard = ({ projectId }: ProjectActivitiesRatingCardProps) => {
  const { data: rating = 0, isLoading } = useActivityRating(projectId);

  console.log('ProjectActivitiesRatingCard - Rendering with rating:', rating);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">مستوى تقييم الأنشطة</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="h-20 animate-pulse bg-muted rounded-lg" />
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
        <CardTitle className="text-sm font-medium">مستوى تقييم الأنشطة</CardTitle>
        <Star className={`h-4 w-4 ${getRatingColor(rating)}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${getRatingColor(rating)}`}>
          {rating.toFixed(1)}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          متوسط تقييم الأنشطة
        </p>
      </CardContent>
    </Card>
  );
};
