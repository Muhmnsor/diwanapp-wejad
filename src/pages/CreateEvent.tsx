import { useParams } from "react-router-dom";
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { EventForm } from "@/components/events/form/EventForm";

const CreateEvent = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  
  return (
    <div className="min-h-screen" dir="rtl">
      <TopHeader />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">
          {isEditMode ? "تعديل الفعالية" : "إنشاء فعالية جديدة"}
        </h1>
        <EventForm id={id} />
      </div>
      <Footer />
    </div>
  );
};

export default CreateEvent;