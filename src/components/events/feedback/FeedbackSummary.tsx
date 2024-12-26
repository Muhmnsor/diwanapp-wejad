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
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold">ملخص التقييمات</h3>
        <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full">
          عدد المقيمين: {feedback.length}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-gray-600 mb-2">التقييم العام</p>
          <p className="text-2xl font-bold">{averages.overall.toFixed(1)}<span className="text-sm text-gray-500"> / 5</span></p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-gray-600 mb-2">تقييم المحتوى</p>
          <p className="text-2xl font-bold">{averages.content.toFixed(1)}<span className="text-sm text-gray-500"> / 5</span></p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-gray-600 mb-2">تقييم التنظيم</p>
          <p className="text-2xl font-bold">{averages.organization.toFixed(1)}<span className="text-sm text-gray-500"> / 5</span></p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-gray-600 mb-2">تقييم المقدم</p>
          <p className="text-2xl font-bold">{averages.presenter.toFixed(1)}<span className="text-sm text-gray-500"> / 5</span></p>
        </div>
      </div>

      {feedback.some(item => item.feedback_text) && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h4 className="font-medium mb-4 text-lg">التعليقات ({feedback.filter(item => item.feedback_text).length})</h4>
          <div className="space-y-3">
            {feedback.map((item) => (
              item.feedback_text && (
                <div key={item.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  {item.feedback_text}
                </div>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  );
};