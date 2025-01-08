import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { ListChecks } from "lucide-react";

const Tasks = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <TopHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <ListChecks className="w-16 h-16 text-primary" />
          <h1 className="text-2xl font-bold text-primary text-center">قيد التطوير</h1>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Tasks;