import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import { useProjectRating } from "@/hooks/useProjectRating";
import { RatingDisplay } from "./rating/RatingDisplay";

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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">مستوى تقييم المشروع</CardTitle>
        <Star className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        <RatingDisplay rating={rating} />
      </CardContent>
    </Card>
  );
};