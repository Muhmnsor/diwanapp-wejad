import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";

const TasksDashboard = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <TopHeader />
      <div className="flex-1 flex items-center justify-center">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">لوحة معلومات المحافظ</h1>
          <p className="text-gray-600">هذه الصفحة قيد التطوير...</p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TasksDashboard;