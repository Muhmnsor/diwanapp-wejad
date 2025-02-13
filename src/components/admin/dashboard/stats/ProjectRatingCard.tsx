
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import { useProjectRating } from "@/hooks/useProjectRating";

interface ProjectRatingCardProps {
  projectId: string;
}

export const ProjectRatingCard = ({ projectId }: ProjectRatingCardProps) => {
  const { data: rating = 0, isLoading } = useProjectRating(projectId);

  console.log('ProjectRatingCard - Rendering with rating:', rating);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">مستوى تقييم المشروع</CardTitle>
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
        <CardTitle className="text-sm font-medium">مستوى تقييم المشروع</CardTitle>
        <Star className={`h-4 w-4 ${getRatingColor(rating)}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${getRatingColor(rating)}`}>
          {rating.toFixed(1)}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          متوسط تقييم المشروع
        </p>
      </CardContent>
    </Card>
  );
};
