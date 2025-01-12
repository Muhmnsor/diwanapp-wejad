import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { AssignedTasks } from "@/components/tasks/AssignedTasks";

const MyTasks = () => {
  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <TopHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-primary">مهامي</h1>
          <AssignedTasks />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MyTasks;