
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { CreateEventFormContainer } from "@/components/events/form/CreateEventFormContainer";
import { Separator } from "@/components/ui/separator";

const CreateEvent = () => {
  return (
    <div className="min-h-screen" dir="rtl">
      <TopHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">إنشاء فعالية جديدة</h1>
          <Separator className="my-6" />
          <CreateEventFormContainer />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CreateEvent;
