import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FeedbackLink } from "@/components/events/feedback/FeedbackLink";
import { RatingsDisplay } from "../shared/RatingsDisplay";

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
    <Card className="p-6">
      <CardHeader className="px-0 pt-0">
        <div className="flex justify-between items-center mb-4">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          <div className="text-sm text-muted-foreground">{date}</div>
        </div>
      </CardHeader>
      <CardContent className="px-0 space-y-6">
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-2">رابط التقييم</h4>
          <FeedbackLink eventId={id} isActivity={true} />
        </div>
        
        {feedback.length > 0 ? (
          <div className="space-y-6">
            <div className="bg-muted/20 p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">نتائج التقييم</h3>
                <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
                  عدد المقيمين: {feedback.length}
                </span>
              </div>
            </div>

            <RatingsDisplay ratings={averages} />

            {feedback.some(f => f.feedback_text) && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium">التعليقات</h4>
                {feedback
                  .filter(f => f.feedback_text)
                  .map((item, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="text-gray-700">{item.feedback_text}</p>
                      {(item.name || item.phone) && (
                        <div className="text-sm text-gray-500 flex gap-2 mt-2 border-t pt-2">
                          {item.name && <span>الاسم: {item.name}</span>}
                          {item.name && item.phone && <span>•</span>}
                          {item.phone && <span>الجوال: {item.phone}</span>}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-muted-foreground text-center py-4">
            لا توجد تقييمات لهذا النشاط
          </div>
        )}
      </CardContent>
    </Card>
  );
};