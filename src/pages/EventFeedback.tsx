import { FeedbackFormContainer } from "@/components/events/feedback/containers/FeedbackFormContainer";

const EventFeedback = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-right">تقييم الفعالية</h1>
        <FeedbackFormContainer />
      </div>
    </div>
  );
};

export default EventFeedback;