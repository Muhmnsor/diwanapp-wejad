import { ActivityFeedbackDisplay } from "@/components/feedback/activities/ActivityFeedbackDisplay";

interface ActivityFeedback {
  id: string;
  title: string;
  date: string;
  feedback: Array<{
    overall_rating: number;
    content_rating: number;
    organization_rating: number;
    presenter_rating: number;
    feedback_text?: string;
    name?: string;
    phone?: string;
  }>;
}

interface FeedbackListProps {
  activities: ActivityFeedback[];
}

export const FeedbackList = ({ activities }: FeedbackListProps) => {
  return (
    <div className="space-y-6">
      {activities.map((activity) => (
        <ActivityFeedbackDisplay
          key={activity.id}
          id={activity.id}
          title={activity.title}
          date={activity.date}
          feedback={activity.feedback}
        />
      ))}
    </div>
  );
};