
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";

const TasksDashboard = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <TopHeader />
      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="flex flex-col items-center justify-center h-full text-center">
          <h1 className="text-3xl font-bold mb-4">إدارة المهام</h1>
          <p className="text-xl text-gray-600">هذه الصفحة قيد التطوير...</p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TasksDashboard;
