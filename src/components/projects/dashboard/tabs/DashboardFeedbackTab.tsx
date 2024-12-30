import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";

interface ActivityFeedback {
  title: string;
  date: string;
  averageRating: number;
  totalFeedback: number;
}

export const DashboardFeedbackTab = ({ projectId }: { projectId: string }) => {
  const { data: activitiesFeedback, isLoading } = useQuery({
    queryKey: ['project-activities-feedback', projectId],
    queryFn: async () => {
      console.log('Fetching activities feedback for project:', projectId);
      
      const { data: activities, error } = await supabase
        .from('events')
        .select(`
          id,
          title,
          date,
          event_feedback (
            overall_rating
          )
        `)
        .eq('project_id', projectId)
        .eq('is_project_activity', true);

      if (error) throw error;

      return activities?.map(activity => ({
        title: activity.title,
        date: activity.date,
        averageRating: activity.event_feedback.length > 0
          ? activity.event_feedback.reduce((sum: number, feedback: any) => 
              sum + (feedback.overall_rating || 0), 0) / activity.event_feedback.length
          : 0,
        totalFeedback: activity.event_feedback.length
      })) || [];
    }
  });

  if (isLoading) {
    return <div>جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">تقييم الأنشطة</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activitiesFeedback?.map((activity: ActivityFeedback) => (
          <Card key={activity.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{activity.title}</CardTitle>
              <Star className={`h-4 w-4 ${activity.averageRating > 0 ? 'text-yellow-400' : 'text-gray-300'}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {activity.averageRating > 0 ? activity.averageRating.toFixed(1) : 'لا يوجد تقييم'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {activity.totalFeedback} تقييم
              </p>
              <div className="text-xs text-muted-foreground mt-1">
                {activity.date}
              </div>
            </CardContent>
          </Card>
        ))}
        {(!activitiesFeedback || activitiesFeedback.length === 0) && (
          <div className="col-span-full text-center text-muted-foreground">
            لا توجد تقييمات للأنشطة حتى الآن
          </div>
        )}
      </div>
    </div>
  );
};