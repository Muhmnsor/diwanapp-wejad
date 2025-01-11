import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";

const TasksDashboard = () => {
  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <TopHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-primary mb-6">لوحة معلومات المهام</h1>
        {/* Content will be added later */}
      </main>

      <Footer />
    </div>
  );
};

export default TasksDashboard;