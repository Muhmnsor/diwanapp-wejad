import { FeedbackFormContainer } from "@/components/events/feedback/containers/FeedbackFormContainer";
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";

const EventFeedback = () => {
  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <TopHeader />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-right">تقييم النشاط</h1>
          <FeedbackFormContainer />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default EventFeedback;