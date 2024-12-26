import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FeedbackStats } from "./components/FeedbackStats";
import { FeedbackComments } from "./components/FeedbackComments";
import { FeedbackAverages } from "./types";

interface FeedbackSummaryProps {
  eventId: string;
}

export const FeedbackSummary = ({ eventId }: FeedbackSummaryProps) => {
  console.log('FeedbackSummary - Initializing with eventId:', eventId);
  
  const { data: feedback = [], isLoading, error } = useQuery({
    queryKey: ['event-feedback', eventId],
    queryFn: async () => {
      console.log('FeedbackSummary - Starting feedback fetch for event:', eventId);
      
      const { data, error } = await supabase
        .from('event_feedback')
        .select('*')
        .eq('event_id', eventId);

      if (error) {
        console.error('Error fetching feedback:', error);
        throw error;
      }
      
      console.log('Fetched feedback data:', data);
      return data || [];
    },
  });

  if (isLoading) {
    console.log('FeedbackSummary - Loading state');
    return <div className="text-center p-4">جاري تحميل التقييمات...</div>;
  }

  if (error) {
    console.error('Error in FeedbackSummary:', error);
    return <div className="text-red-500 p-4">حدث خطأ في تحميل التقييمات</div>;
  }

  if (!feedback || feedback.length === 0) {
    console.log('FeedbackSummary - No feedback found');
    return <div className="text-gray-500 p-4">لا توجد تقييمات حتى الآن</div>;
  }

  console.log('FeedbackSummary - Rendering feedback count:', feedback.length);

  const calculateAverage = (ratings: (number | null)[]) => {
    const validRatings = ratings.filter((r): r is number => r !== null);
    if (validRatings.length === 0) return 0;
    return validRatings.reduce((a, b) => a + b, 0) / validRatings.length;
  };

  const averages: FeedbackAverages = {
    overall: calculateAverage(feedback.map(f => f.overall_rating)),
    content: calculateAverage(feedback.map(f => f.content_rating)),
    organization: calculateAverage(feedback.map(f => f.organization_rating)),
    presenter: calculateAverage(feedback.map(f => f.presenter_rating)),
  };

  console.log('FeedbackSummary - Calculated averages:', averages);

  return (
    <div className="space-y-6" dir="rtl">
      <FeedbackStats feedback={feedback} averages={averages} />
      <FeedbackComments feedback={feedback} />
    </div>
  );
};