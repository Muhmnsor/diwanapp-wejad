
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import { useProjectRating } from "@/hooks/useProjectRating";
import { RatingDisplay } from "./rating/RatingDisplay";

interface ProjectRatingCardProps {
  projectId: string;
}

export const ProjectRatingCard = ({ projectId }: ProjectRatingCardProps) => {
  const { data: averageRating = 0, isLoading } = useProjectRating(projectId);
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          متوسط تقييم المشروع
        </CardTitle>
        <Star className="h-4 w-4 text-yellow-500" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-2">
            <div className="text-2xl font-bold">...</div>
          </div>
        ) : (
          <RatingDisplay rating={averageRating} />
        )}
      </CardContent>
    </Card>
  );
};
