
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";

interface ProjectRatingCardProps {
  projectId: string;
}

export const ProjectRatingCard = ({ projectId }: ProjectRatingCardProps) => {
  const { data, isLoading } = useQuery({
    queryKey: ['project-rating', projectId],
    queryFn: async () => {
      // Get project feedback ratings
      const { data: feedback, error } = await supabase
        .from('project_feedback')
        .select('overall_rating')
        .eq('project_id', projectId);
      
      if (error) {
        console.error('Error fetching project ratings:', error);
        throw error;
      }
      
      // Calculate average rating if there are any ratings
      const validRatings = feedback?.filter(f => f.overall_rating !== null) || [];
      const averageRating = validRatings.length > 0
        ? validRatings.reduce((sum, item) => sum + (item.overall_rating || 0), 0) / validRatings.length
        : 0;
      
      return {
        averageRating: averageRating.toFixed(1),
        ratingsCount: validRatings.length
      };
    },
    enabled: !!projectId
  });
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          متوسط تقييم المشروع
        </CardTitle>
        <Star className="h-4 w-4 text-yellow-500" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">
            {isLoading ? '...' : data?.averageRating || '0.0'}
          </div>
          <div className="text-xs text-muted-foreground">
            من {isLoading ? '...' : data?.ratingsCount || 0} تقييم
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {!data?.ratingsCount 
            ? 'لم يتم تقييم المشروع بعد' 
            : `تم تقييم المشروع بواسطة ${data.ratingsCount} مشارك`}
        </p>
      </CardContent>
    </Card>
  );
};
