import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RatingInput } from "@/components/events/feedback/RatingInput";
import { PersonalInfoSection } from "@/components/events/feedback/PersonalInfoSection";
import { RatingsSection } from "@/components/events/feedback/RatingsSection";
import { CommentsSection } from "@/components/events/feedback/CommentsSection";

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

      if (error) {
        console.error('Error fetching activities feedback:', error);
        throw error;
      }
      
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
    return <div className="text-center p-4">جاري تحميل التقييمات...</div>;
  }

  const renderActivityFeedback = (activity: ActivityFeedback) => {
    if (!activity?.feedback || activity.feedback.length === 0) {
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

    return (
      <Card key={activity.id} className="p-6">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-lg font-semibold">{activity.title}</CardTitle>
          <div className="text-sm text-muted-foreground">{activity.date}</div>
        </CardHeader>
        <CardContent className="px-0 space-y-6">
          {activity.feedback.map((feedback, index) => (
            <div key={index} className="space-y-6 border-b pb-6 last:border-0">
              <RatingsSection
                overallRating={feedback.overall_rating}
                contentRating={feedback.content_rating}
                organizationRating={feedback.organization_rating}
                presenterRating={feedback.presenter_rating}
                onOverallRatingChange={() => {}}
                onContentRatingChange={() => {}}
                onOrganizationRatingChange={() => {}}
                onPresenterRatingChange={() => {}}
              />
              
              {(feedback.name || feedback.phone) && (
                <div className="mt-6">
                  <PersonalInfoSection
                    name={feedback.name || ''}
                    phone={feedback.phone || ''}
                    onNameChange={() => {}}
                    onPhoneChange={() => {}}
                  />
                </div>
              )}
              
              {feedback.feedback_text && (
                <div className="mt-6">
                  <CommentsSection
                    value={feedback.feedback_text}
                    onChange={() => {}}
                  />
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">تقييم الأنشطة</h2>
      <div className="space-y-6">
        {activitiesFeedback && activitiesFeedback.length > 0 ? (
          activitiesFeedback.map(renderActivityFeedback)
        ) : (
          <div className="text-center text-muted-foreground">
            لا توجد أنشطة لعرض تقييماتها
          </div>
        )}
      </div>
    </div>
  );
};