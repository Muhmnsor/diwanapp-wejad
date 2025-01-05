import { useParams } from "react-router-dom";
import { FeedbackFormContainer } from "@/components/events/feedback/containers/FeedbackFormContainer";

const EventFeedback = () => {
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

export default EventFeedback;