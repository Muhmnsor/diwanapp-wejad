import { Navigation } from "@/components/Navigation";

const NotFound = () => {
  return (
    <div dir="rtl">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">404 - الصفحة غير موجودة</h1>
          <p className="mt-2">عذراً، الصفحة التي تبحث عنها غير موجودة.</p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;