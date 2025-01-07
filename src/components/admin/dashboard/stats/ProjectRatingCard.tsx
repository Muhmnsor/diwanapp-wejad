import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import { useProjectRating } from "@/hooks/useProjectRating";
import { RatingDisplay } from "./rating/RatingDisplay";

interface ProjectRatingCardProps {
  projectId: string;
}

export const ProjectRatingCard = ({ projectId }: ProjectRatingCardProps) => {
  const { data: averageRating = 0 } = useProjectRating(projectId);

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">مستوى تقييم المشروع</CardTitle>
        <Star className={`h-4 w-4 ${getRatingColor(averageRating)}`} />
      </CardHeader>
      <CardContent>
        <RatingDisplay rating={averageRating} />
      </CardContent>
    </Card>
  );
};