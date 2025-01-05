import { useParams } from "react-router-dom";
import { FeedbackFormContainer } from "@/components/events/feedback/containers/FeedbackFormContainer";
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";

const EventFeedback = () => {
  const { id } = useParams();
  console.log('EventFeedback - Event ID:', id);
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50" dir="rtl">
      <TopHeader />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold mb-6 text-right">تقييم الفعالية</h1>
          <FeedbackFormContainer eventId={id} />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default EventFeedback;