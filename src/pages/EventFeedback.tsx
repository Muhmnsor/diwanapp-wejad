import { useParams } from "react-router-dom";
import { EventFeedbackForm } from "@/components/events/feedback/EventFeedbackForm";
import { FeedbackFormContainer } from "@/components/events/feedback/containers/FeedbackFormContainer";

export const EventFeedback = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <div>Event ID is required</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <FeedbackFormContainer eventId={id} />
    </div>
  );
};