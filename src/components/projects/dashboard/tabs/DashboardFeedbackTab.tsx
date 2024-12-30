import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import { FeedbackStats } from "@/components/events/feedback/components/FeedbackStats";
import { FeedbackComments } from "@/components/events/feedback/components/FeedbackComments";

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
            overall_rating,
            content_rating,
            organization_rating,
            presenter_rating,
            feedback_text,
            name,
            phone
          )
        `)
        .eq('project_id', projectId)
        .eq('is_project_activity', true);

      if (error) throw error;
      console.log('Fetched activities with feedback:', activities);

      return activities?.map(activity => ({
        id: activity.id,
        title: activity.title,
        date: activity.date,
        feedback: activity.event_feedback || []
      })) || [];
    }
  });

  if (isLoading) {
    return <div>جاري التحميل...</div>;
  }

  const renderActivityFeedback = (activity: ActivityFeedback) => {
    if (!activity.feedback.length) {
      return (
        <Card key={activity.id} className="p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-lg font-semibold">{activity.title}</CardTitle>
          </CardHeader>
          <CardContent className="px-0 text-muted-foreground">
            لا توجد تقييمات لهذا النشاط
          </CardContent>
        </Card>
      );
    }

    const averages = {
      overall: activity.feedback.reduce((sum, f) => sum + (f.overall_rating || 0), 0) / activity.feedback.length,
      content: activity.feedback.reduce((sum, f) => sum + (f.content_rating || 0), 0) / activity.feedback.length,
      organization: activity.feedback.reduce((sum, f) => sum + (f.organization_rating || 0), 0) / activity.feedback.length,
      presenter: activity.feedback.reduce((sum, f) => sum + (f.presenter_rating || 0), 0) / activity.feedback.length,
    };

    return (
      <Card key={activity.id} className="p-6">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-lg font-semibold">{activity.title}</CardTitle>
          <div className="text-sm text-muted-foreground">{activity.date}</div>
        </CardHeader>
        <CardContent className="px-0 space-y-6">
          <FeedbackStats 
            feedback={activity.feedback}
            averages={averages}
          />
          <FeedbackComments 
            feedback={activity.feedback}
          />
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">تقييم الأنشطة</h2>
      <div className="space-y-6">
        {activitiesFeedback?.map(renderActivityFeedback)}
        {(!activitiesFeedback || activitiesFeedback.length === 0) && (
          <div className="text-center text-muted-foreground">
            لا توجد أنشطة لعرض تقييماتها
          </div>
        )}
      </div>
    </div>
  );
};