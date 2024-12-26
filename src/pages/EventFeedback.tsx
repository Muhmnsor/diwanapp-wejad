import { useParams } from "react-router-dom";
import { EventFeedbackForm } from "@/components/events/feedback/EventFeedbackForm";

const EventFeedback = () => {
  const { id } = useParams();

  if (!id) {
    return <div>Event ID is required</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8 text-right">تقييم الفعالية</h1>
      <EventFeedbackForm eventId={id} />
    </div>
  );
};

export default EventFeedback;