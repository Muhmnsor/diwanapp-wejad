
import { Navigation } from "@/components/Navigation";
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";

export const EventNotFound = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <TopHeader />
      <div className="flex-grow container mx-auto px-4 py-20" dir="rtl">
        <div className="text-center max-w-lg mx-auto bg-white p-10 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4">لم يتم العثور على الصفحة</h1>
          <p className="text-gray-500 mb-6">الصفحة التي تحاول الوصول إليها غير موجودة أو ربما تم نقلها.</p>
          <a 
            href="/"
            className="inline-flex items-center justify-center bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            العودة إلى الصفحة الرئيسية
          </a>
        </div>
      </div>
      <Footer />
    </div>
  );
};
