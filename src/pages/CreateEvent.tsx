import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { CreateEventFormContainer } from "@/components/events/form/CreateEventFormContainer";

const CreateEvent = () => {
  return (
    <div className="min-h-screen" dir="rtl">
      <TopHeader />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">إنشاء فعالية جديدة</h1>
        <CreateEventFormContainer />
      </div>
      <Footer />
    </div>
  );
};

export default CreateEvent;