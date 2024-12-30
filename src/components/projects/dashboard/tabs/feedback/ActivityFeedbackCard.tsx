import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FeedbackLink } from "@/components/events/feedback/FeedbackLink";
import { RatingsSection } from "@/components/events/feedback/RatingsSection";
import { PersonalInfoSection } from "@/components/events/feedback/PersonalInfoSection";
import { CommentsSection } from "@/components/events/feedback/CommentsSection";

interface ActivityFeedback {
  overall_rating: number;
  content_rating: number;
  organization_rating: number;
  presenter_rating: number;
  feedback_text?: string;
  name?: string;
  phone?: string;
}

interface ActivityFeedbackCardProps {
  id: string;
  title: string;
  date: string;
  feedback: ActivityFeedback[];
}

export const ActivityFeedbackCard = ({ id, title, date, feedback }: ActivityFeedbackCardProps) => {
  console.log('ActivityFeedbackCard - Rendering for activity:', { id, title, feedback });
  
  return (
    <Card className="p-6">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        <div className="text-sm text-muted-foreground">{date}</div>
      </CardHeader>
      <CardContent className="px-0 space-y-6">
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-2">رابط التقييم</h4>
          <FeedbackLink eventId={id} isActivity={true} />
        </div>
        
        {feedback.length > 0 ? (
          feedback.map((feedback, index) => (
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
          ))
        ) : (
          <div className="text-muted-foreground">
            لا توجد تقييمات لهذا النشاط
          </div>
        )}
      </CardContent>
    </Card>
  );
};