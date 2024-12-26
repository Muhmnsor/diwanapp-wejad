import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface FeedbackSummaryProps {
  eventId: string;
}

export const FeedbackSummary = ({ eventId }: FeedbackSummaryProps) => {
  const { data: feedback = [], isLoading } = useQuery({
    queryKey: ['event-feedback', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_feedback')
        .select('*')
        .eq('event_id', eventId);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>جاري تحميل التقييمات...</div>;
  }

  const calculateAverage = (ratings: (number | null)[]) => {
    const validRatings = ratings.filter((r): r is number => r !== null);
    if (validRatings.length === 0) return 0;
    return validRatings.reduce((a, b) => a + b, 0) / validRatings.length;
  };

  const averages = {
    overall: calculateAverage(feedback.map(f => f.overall_rating)),
    content: calculateAverage(feedback.map(f => f.content_rating)),
    organization: calculateAverage(feedback.map(f => f.organization_rating)),
    presenter: calculateAverage(feedback.map(f => f.presenter_rating)),
  };

  return (
    <div className="space-y-4" dir="rtl">
      <h3 className="text-lg font-semibold">ملخص التقييمات</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="font-medium">التقييم العام</p>
          <p>{averages.overall.toFixed(1)} / 5</p>
        </div>
        <div>
          <p className="font-medium">تقييم المحتوى</p>
          <p>{averages.content.toFixed(1)} / 5</p>
        </div>
        <div>
          <p className="font-medium">تقييم التنظيم</p>
          <p>{averages.organization.toFixed(1)} / 5</p>
        </div>
        <div>
          <p className="font-medium">تقييم المقدم</p>
          <p>{averages.presenter.toFixed(1)} / 5</p>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="font-medium mb-2">التعليقات ({feedback.length})</h4>
        <div className="space-y-2">
          {feedback.map((item) => (
            item.feedback_text && (
              <div key={item.id} className="p-3 bg-gray-50 rounded-lg">
                {item.feedback_text}
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
};