import { supabase } from '@/integrations/supabase/client';

interface FeedbackSummary {
  averageOverallRating: number;
  averageContentRating: number;
  averageOrganizationRating: number;
  averagePresenterRating: number;
  totalFeedbacks: number;
}

export const fetchFeedbackSummary = async (eventId: string): Promise<FeedbackSummary> => {
  console.log('Fetching feedback summary for event:', eventId);
  
  const { data: feedbacks, error } = await supabase
    .from('event_feedback')
    .select('overall_rating, content_rating, organization_rating, presenter_rating')
    .eq('event_id', eventId);

  if (error) {
    console.error('Error fetching feedback:', error);
    throw error;
  }

  if (!feedbacks.length) {
    return {
      averageOverallRating: 0,
      averageContentRating: 0,
      averageOrganizationRating: 0,
      averagePresenterRating: 0,
      totalFeedbacks: 0
    };
  }

  const sum = feedbacks.reduce((acc, feedback) => ({
    overall: acc.overall + (feedback.overall_rating || 0),
    content: acc.content + (feedback.content_rating || 0),
    organization: acc.organization + (feedback.organization_rating || 0),
    presenter: acc.presenter + (feedback.presenter_rating || 0)
  }), { overall: 0, content: 0, organization: 0, presenter: 0 });

  return {
    averageOverallRating: sum.overall / feedbacks.length,
    averageContentRating: sum.content / feedbacks.length,
    averageOrganizationRating: sum.organization / feedbacks.length,
    averagePresenterRating: sum.presenter / feedbacks.length,
    totalFeedbacks: feedbacks.length
  };
};