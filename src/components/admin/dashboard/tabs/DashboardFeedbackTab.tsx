import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DashboardFeedbackTabProps {
  projectId: string;
}

export const DashboardFeedbackTab = ({ projectId }: DashboardFeedbackTabProps) => {
  const { data: feedback = [] } = useQuery({
    queryKey: ['project-feedback', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_feedback')
        .select('*')
        .eq('event_id', projectId);

      if (error) throw error;
      return data || [];
    },
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">تقييمات المشروع</h2>
      {feedback.length === 0 ? (
        <p className="text-muted-foreground">لا يوجد تقييمات حتى الآن</p>
      ) : (
        <div className="grid gap-4">
          {feedback.map((item) => (
            <div key={item.id} className="bg-card p-4 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{item.feedback_text}</p>
                </div>
                <div className="text-sm">
                  التقييم: {item.overall_rating}/5
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};