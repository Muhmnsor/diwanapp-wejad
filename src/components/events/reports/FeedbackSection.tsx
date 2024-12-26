import { FeedbackLink } from "../feedback/FeedbackLink";
import { FeedbackSummary } from "../feedback/FeedbackSummary";

interface FeedbackSectionProps {
  eventId: string;
}

export const FeedbackSection = ({ eventId }: FeedbackSectionProps) => {
  return (
    <>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">رابط التقييم</h3>
        <FeedbackLink eventId={eventId} />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">نتائج التقييم</h3>
        <FeedbackSummary eventId={eventId} />
      </div>
    </>
  );
};