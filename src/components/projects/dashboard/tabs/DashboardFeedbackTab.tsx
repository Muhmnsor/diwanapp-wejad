
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ActivityFeedbackDisplay } from "@/components/feedback/activities/ActivityFeedbackDisplay";

interface ActivityFeedback {
  id: string;
  title: string;
  date: string;
  feedback: Array<{
    overall_rating: number;
    content_rating: number;
    organization_rating: number;
    presenter_rating: number;
    feedback_text?: string;
    name?: string;
    phone?: string;
  }>;
}

export const DashboardFeedbackTab = ({ projectId }: { projectId: string }) => {
  console.log('DashboardFeedbackTab - Initializing with projectId:', projectId);
  
  const { data: activitiesFeedback, isLoading } = useQuery({
    queryKey: ['project-activities-feedback', projectId],
    queryFn: async () => {
      console.log('Fetching activities feedback for project:', projectId);
      
      const { data: activities, error } = await supabase
        .from('project_activities')
        .select(`
          id,
          title,
          date,
          activity_feedback (
            overall_rating,
            content_rating,
            organization_rating,
            presenter_rating,
            feedback_text,
            name,
            phone
          )
        `)
        .eq('project_id', projectId);

      if (error) {
        console.error('Error fetching activities feedback:', error);
        throw error;
      }
      
      console.log('Fetched activities with feedback:', activities);
      
      return activities?.map(activity => ({
        id: activity.id,
        title: activity.title,
        date: activity.date,
        feedback: activity.activity_feedback || []
      })) || [];
    }
  });

  if (isLoading) {
    return <div className="text-center p-4">جاري تحميل التقييمات...</div>;
  }

  if (!activitiesFeedback || activitiesFeedback.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        لا توجد أنشطة لعرض تقييماتها
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">تقييم الأنشطة</h2>
      <div className="space-y-6">
        {activitiesFeedback.map((activity) => (
          <ActivityFeedbackDisplay
            key={activity.id}
            id={activity.id}
            title={activity.title}
            date={activity.date}
            feedback={activity.feedback}
          />
        ))}
      </div>
    </div>
  );
};
