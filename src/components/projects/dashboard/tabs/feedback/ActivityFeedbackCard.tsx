import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FeedbackLink } from "@/components/events/feedback/FeedbackLink";

interface ActivityFeedback {
  overall_rating: number;
  content_rating: number;
  organization_rating: number;
  presenter_rating: number;
}

interface ActivityFeedbackCardProps {
  id: string;
  title: string;
  date: string;
  feedback: ActivityFeedback[];
}

export const ActivityFeedbackCard = ({ id, title, date, feedback }: ActivityFeedbackCardProps) => {
  console.log('ActivityFeedbackCard - Rendering for activity:', { id, title, feedback });

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

  const ratingLabels = {
    overall: 'التقييم العام',
    content: 'تقييم المحتوى',
    organization: 'تقييم التنظيم',
    presenter: 'تقييم المقدم'
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600 bg-green-50';
    if (rating >= 3) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(averages).map(([key, value]) => (
                <Card key={key} className={`p-4 ${getRatingColor(value)}`}>
                  <div className="flex flex-col items-center justify-center text-center">
                    <span className="text-sm font-medium mb-2">
                      {ratingLabels[key as keyof typeof ratingLabels]}
                    </span>
                    <span className="text-2xl font-bold">
                      {value.toFixed(1)}
                    </span>
                    <span className="text-xs mt-1">من 5</span>
                  </div>
                </Card>
              ))}
            </div>
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