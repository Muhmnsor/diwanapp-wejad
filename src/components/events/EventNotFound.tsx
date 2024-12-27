import { Navigation } from "@/components/Navigation";

export const EventNotFound = () => {
  return (
    <div dir="rtl">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">لم يتم العثور على الفعالية</h1>
        </div>
      </div>
    </div>
  );
};