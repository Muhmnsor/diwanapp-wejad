import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { CreateProjectForm } from "@/components/projects/CreateProjectForm";

const CreateProject = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <TopHeader />
      <div className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">إنشاء مشروع جديد</h1>
            <CreateProjectForm />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CreateProject;