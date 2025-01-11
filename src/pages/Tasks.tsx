import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { DepartmentsList } from "@/components/tasks/DepartmentsList";
import { AssignedTasks } from "@/components/tasks/AssignedTasks";

const Tasks = () => {
  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <TopHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8 space-y-8">
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-primary">الإدارات والوحدات</h1>
          <DepartmentsList />
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-800">المهام المكلف بها</h2>
          <AssignedTasks />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Tasks;