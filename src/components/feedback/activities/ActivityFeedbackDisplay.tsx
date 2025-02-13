
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FeedbackLink } from "@/components/events/feedback/FeedbackLink";
import { RatingsDisplay } from "../shared/RatingsDisplay";
import { CalendarDays, Users } from "lucide-react";

interface ActivityFeedback {
  overall_rating: number;
  content_rating: number;
  organization_rating: number;
  presenter_rating: number;
  feedback_text?: string;
  name?: string;
  phone?: string;
}

interface ActivityFeedbackDisplayProps {
  id: string;
  title: string;
  date: string;
  feedback: ActivityFeedback[];
}

export const ActivityFeedbackDisplay = ({ 
  id, 
  title, 
  date, 
  feedback 
}: ActivityFeedbackDisplayProps) => {
  console.log('ActivityFeedbackDisplay - Rendering for activity:', { id, title, feedback });

  const calculateAverage = (ratings: number[]) => {
    const validRatings = ratings.filter(r => r !== null);
    if (validRatings.length === 0) return 0;
    return validRatings.reduce((a, b) => a + b, 0) / validRatings.length;
  };

  const averages = {
    overall: calculateAverage(feedback.map(f => f.overall_rating)),
    content: calculateAverage(feedback.map(f => f.content_rating)),
    organization: calculateAverage(feedback.map(f => f.organization_rating)),
    presenter: calculateAverage(feedback.map(f => f.presenter_rating))
  };

  return (
    <Card className="transition-all duration-200 hover:shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex flex-col space-y-2">
          <CardTitle className="text-xl font-bold">{title}</CardTitle>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <CalendarDays className="h-4 w-4" />
              <span>{date}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{feedback.length} مشارك</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="rounded-lg bg-muted/30 p-4">
          <h4 className="text-sm font-medium mb-2">رابط التقييم</h4>
          <FeedbackLink eventId={id} isActivity={true} />
        </div>
        
        {feedback.length > 0 ? (
          <div className="space-y-6">
            <RatingsDisplay ratings={averages} />

            {feedback.some(f => f.feedback_text) && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium">التعليقات والملاحظات</h4>
                <div className="grid gap-4">
                  {feedback
                    .filter(f => f.feedback_text)
                    .map((item, index) => (
                      <div 
                        key={index} 
                        className="rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50"
                      >
                        <p className="text-sm text-card-foreground leading-relaxed">
                          {item.feedback_text}
                        </p>
                        {(item.name || item.phone) && (
                          <div className="mt-3 pt-3 border-t border-border/50 flex gap-3 text-xs text-muted-foreground">
                            {item.name && <span>الاسم: {item.name}</span>}
                            {item.phone && <span>الجوال: {item.phone}</span>}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            لا توجد تقييمات لهذا النشاط
          </div>
        )}
      </CardContent>
    </Card>
  );
};
