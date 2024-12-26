import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { EventFeedbackForm } from "@/components/events/feedback/EventFeedbackForm";
import { useParams } from "react-router-dom";

const EventFeedback = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen" dir="rtl">
      <TopHeader />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">تقييم الفعالية</h1>
        <EventFeedbackForm eventId={id || ""} />
      </div>
      <Footer />
    </div>
  );
};

export default EventFeedback;