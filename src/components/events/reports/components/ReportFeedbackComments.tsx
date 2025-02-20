
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ReportFeedbackCommentsProps {
  eventId: string;
}

export const ReportFeedbackComments = ({ eventId }: ReportFeedbackCommentsProps) => {
  const { data: feedback = [] } = useQuery({
    queryKey: ['event-feedback', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_feedback')
        .select('feedback_text, name, phone')
        .eq('event_id', eventId)
        .not('feedback_text', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  if (feedback.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-lg">انطباعات المشاركين</h4>
      <div className="grid gap-3">
        {feedback.map((item, index) => (
          <Card key={index} className="p-4 bg-muted/30">
            <p className="text-gray-700 leading-relaxed">{item.feedback_text}</p>
            {(item.name || item.phone) && (
              <div className="mt-3 pt-3 border-t border-border/50 flex gap-3 text-sm text-muted-foreground">
                {item.name && <span>الاسم: {item.name}</span>}
                {item.phone && <span>الجوال: {item.phone}</span>}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
