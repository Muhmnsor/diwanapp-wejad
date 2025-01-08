import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { FileText } from "lucide-react";

const Documents = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <TopHeader />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <FileText className="w-16 h-16 text-primary" />
          <h1 className="text-2xl font-bold text-center">قيد التطوير</h1>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Documents;