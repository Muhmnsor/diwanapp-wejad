
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";

const Projects = () => {
  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <TopHeader />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-2xl font-bold mb-4">المشاريع</h1>
        <p className="text-muted-foreground mb-6">إدارة مشاريع المؤسسة</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="font-semibold text-lg">مشروع جديد</h2>
            <p className="text-muted-foreground">أضف مشروعاً جديداً</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Projects;
