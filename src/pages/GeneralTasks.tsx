
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { TasksList } from "@/components/tasks/project-details/TasksList";

const GeneralTasks = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <TopHeader />
      <div className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto" dir="rtl">
            <div className="mb-8">
              <h1 className="text-2xl font-bold mb-4">المهام العامة</h1>
              <p className="text-gray-600">
                إدارة المهام العامة غير المرتبطة بمشاريع محددة
              </p>
            </div>
            
            <div className="space-y-8">
              <TasksList />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default GeneralTasks;
