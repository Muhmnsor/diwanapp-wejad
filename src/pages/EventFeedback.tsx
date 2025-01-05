import { useParams } from "react-router-dom";
import { EventFeedbackForm } from "@/components/events/feedback/EventFeedbackForm";
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";

const EventFeedback = () => {
  const { id } = useParams();
  console.log('Rendering EventFeedback page for event:', id);
  
  if (!id) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h1 className="text-2xl font-bold text-red-500">خطأ في معرف الفعالية</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50" dir="rtl">
      <TopHeader />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold mb-6 text-right">تقييم الفعالية</h1>
          <EventFeedbackForm eventId={id} />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default EventFeedback;